"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { CredentialCard } from "@/components/credential-card";
import { QRCodeSVG } from "qrcode.react";
import { RiskBadge } from "@/components/risk-badge";
import { PrintReceipt } from "@/components/print-receipt";
import {
  verifyOnChain,
  verifyGrantSignature,
  verifyIssuerAttestation,
  acceptMigrationOnChain,
  getTokenIdByHash,
  fetchRegistryStats,
  getCredentialOnChain,
} from "@/lib/contract-client";
import { scoreRisk } from "@/lib/ai-risk";
import { credentialHashBytes32 } from "@/lib/hash";
import type { Credential, RiskReport } from "@/lib/types";
import { WalletConnect } from "@/components/wallet-connect";
import type { Address, Hex } from "viem";

const demoCredential: Credential = {
  id: "cred-demo-1",
  issuerDid: "did:web:university-a.edu",
  issuerName: "University A",
  studentName: "Aisha Verma",
  studentAddress: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
  rollNumber: "2021CS045",
  course: "B.Tech Computer Science",
  docType: "degree",
  issuedAt: "2025-06-15T10:00:00Z",
  claims: { cgpa: 8.4, program: "B.Tech" },
};

interface GrantPayload {
  verifier: Address;
  credentialId: string;
  expiresAt: number;
  signature: Hex;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [risk, setRisk] = useState<RiskReport | null>(null);
  const [issuerSigValid, setIssuerSigValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptStatus, setAcceptStatus] = useState("");
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<number>(0);

  async function acceptMigration() {
    if (!credential || !isConnected || !address || tokenId === null || !walletClient)
      return;
    setIsAccepting(true);
    setAcceptStatus("Confirm in wallet...");
    try {
      const tx = await acceptMigrationOnChain(
        walletClient,
        address as Address,
        tokenId,
        address as Address,
      );
      setAcceptStatus(`Migration Accepted! Tx: ${tx.slice(0, 10)}...`);
      setMigrationStatus(3); // Accepted
    } catch (e: any) {
      setAcceptStatus("Error: " + e.message);
    } finally {
      setIsAccepting(false);
    }
  }

  async function runVerification(raw: string) {
    setError("");
    setResult(null);
    setCredential(null);
    setRisk(null);
    setIssuerSigValid(null);
    setAcceptStatus("");
    setTokenId(null);
    setMigrationStatus(0);
    setIsLoading(true);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(raw);
      } catch {
        throw new Error("That is not valid credential JSON.");
      }

      let parsedCred: Credential;
      let grant: GrantPayload | undefined;

      if (parsedPayload.grant && parsedPayload.credential) {
        parsedCred = parsedPayload.credential;
        grant = parsedPayload.grant as GrantPayload;

        if (Math.floor(Date.now() / 1000) > grant.expiresAt) {
          throw new Error("ACCESS DENIED: This credential grant has expired.");
        }

        const revokeRes = await fetch(
          `/api/revoke-grant?signature=${encodeURIComponent(grant.signature)}`,
        );
        const revokeData = await revokeRes.json();
        if (revokeData.isRevoked) {
          throw new Error(
            "ACCESS DENIED: The student has actively revoked this access link.",
          );
        }

        const isValidSignature = await verifyGrantSignature(
          grant,
          parsedCred.studentAddress as Address,
        );
        if (!isValidSignature) {
          throw new Error("ACCESS DENIED: Invalid or tampered grant signature.");
        }

        // Enforce the "specific verifier" grant. If a real verifier address is
        // pinned, only that connected wallet may open the link.
        const isBearer =
          grant.verifier === "0x0000000000000000000000000000000000000000";
        if (!isBearer && (!isConnected || address !== grant.verifier)) {
          throw new Error(
            "ACCESS DENIED: This grant is bound to a specific verifier.",
          );
        }
      } else {
        parsedCred = parsedPayload as Credential;
      }

      const verification = await verifyOnChain(parsedCred);
      setResult(verification);
      setCredential({
        ...parsedCred,
        issuerName: verification.issuerName || parsedCred.issuerName,
      });

      const tid = await getTokenIdByHash(credentialHashBytes32(parsedCred));
      if (tid !== null) {
        setTokenId(Number(tid));
        const onchain = await getCredentialOnChain(tid);
        setMigrationStatus(onchain.migrationStatus);
      }

      // Real issuer-signature validation against the on-chain issuer address.
      // Empty (seeded demo) signatures are "N/A", not "INVALID".
      const sig = (parsedPayload as any).issuerSignature;
      if (verification.valid && sig && sig !== "0x") {
        const valid = await verifyIssuerAttestation(
          parsedCred,
          (parsedPayload as any).cid ?? "",
          sig,
          verification.issuer as Address,
        );
        setIssuerSigValid(valid);
      } else {
        setIssuerSigValid(null);
      }

      // Real AI stats from the contract's issuer counters.
      const stats = await fetchRegistryStats(
        (verification.issuer as Address) ??
          "0x0000000000000000000000000000000000000000",
      );
      const oracleRes = await fetch("/api/oracle/risk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential: parsedCred, stats }) });
      const oracleData = await oracleRes.json();
      setRisk({ ...oracleData.risk, oracleSignature: oracleData.signature, oracleAddress: oracleData.oracleAddress });

      if (grant) {
        fetch("/api/access-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentAddress: parsedCred.studentAddress,
            credentialId: parsedCred.id,
            verifierAddress: isConnected ? address : "Anonymous Portal User",
            docType: parsedCred.docType,
          }),
        }).catch(console.error);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const c = searchParams.get("c");
    if (c) {
      try {
        const decoded = atob(c);
        setInput(decoded);
        runVerification(decoded);
      } catch {
        setError("Failed to decode credential from QR code link.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const migrationLabel = (status: number) =>
    ["none", "issued", "presented", "accepted"][status] ?? "unknown";

  return (
    <>
    <main className="mx-auto max-w-3xl px-6 py-24 print:hidden">
      <header className="mb-12 flex justify-between items-start">
        <div>
          <a
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-inkMuted hover:text-ink transition-colors"
          >
            &larr; Back to protocol
          </a>
          <h1 className="mt-6 text-4xl md:text-5xl font-sans tracking-tighter uppercase">
            Verify <span className="text-inkMuted">Asset</span>
          </h1>
          <p className="mt-4 text-inkMuted max-w-xl">
            Zero-knowledge required. Paste the credential JSON below to run a
            direct, mathematically verified on-chain check against the local
            node.
          </p>
        </div>
        <div className="hidden md:block">
          <WalletConnect />
        </div>
      </header>

      <div className="space-y-8">
        <div className="bg-surface border border-border p-8 flex flex-col relative group">
          <label
            htmlFor="credential-json"
            className="mb-4 block font-mono text-xs uppercase tracking-widest text-inkMuted"
          >
            // CREDENTIAL_PAYLOAD
          </label>
          <textarea
            id="credential-json"
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"id":"cred-1","issuerName":"University A",...}'
            className="w-full border border-border bg-background p-4 font-mono text-sm leading-relaxed text-ink focus:border-ink/50 focus:outline-none transition-colors resize-none placeholder:text-border"
          />
          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => runVerification(input)}
              disabled={isLoading}
              className="bg-accent text-background px-8 py-3 text-sm font-medium uppercase tracking-widest transition-transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Execute Check"}
            </button>
            <button
              type="button"
              onClick={() => {
                const demo = JSON.stringify(demoCredential, null, 2);
                setInput(demo);
                runVerification(demo);
              }}
              disabled={isLoading}
              className="border border-border bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-widest text-ink transition-all hover:border-ink/50 disabled:opacity-50"
            >
              Load Demo Asset
            </button>
          </div>
          {error && (
            <div className="mt-6 p-4 border border-tampered bg-tamperedBg">
              <p className="font-mono text-xs uppercase tracking-widest text-tampered">
                {error}
              </p>
            </div>
          )}
        </div>

        {result && credential && (
          <div className="space-y-6">
            <CredentialCard
              credential={credential}
              status={
                result.valid
                  ? result.revoked
                    ? "REVOKED"
                    : "VALID"
                  : "TAMPERED"
              }
            />

            {issuerSigValid !== null && (
              <div
                className={`p-4 border font-mono text-xs uppercase tracking-widest ${
                  issuerSigValid
                    ? "border-valid bg-validBg text-valid"
                    : "border-tampered bg-tamperedBg text-tampered"
                }`}
              >
                ISSUER SIGNATURE: {issuerSigValid ? "VALID" : "INVALID"}
              </div>
            )}

            {result.valid &&
              !result.revoked &&
              credential.docType.toLowerCase() === "migration" && (
                <div className="p-6 border border-border bg-surface flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-medium">
                        Destination University Action
                      </h3>
                      <p className="text-sm text-inkMuted mt-1">
                        Migration status:{" "}
                        <span className="text-ink uppercase">
                          {migrationLabel(migrationStatus)}
                        </span>
                      </p>
                    </div>
                    {migrationStatus === 2 &&
                      (!isConnected ? (
                        <p className="text-xs font-mono uppercase tracking-widest text-tampered">
                          CONNECT WALLET TO ACCEPT
                        </p>
                      ) : (
                        <button
                          onClick={acceptMigration}
                          disabled={isAccepting}
                          className="bg-ink text-background px-6 py-2 text-sm font-medium uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
                        >
                          {isAccepting ? "PROCESSING..." : "ACCEPT MIGRATION"}
                        </button>
                      ))}
                  </div>
                  {acceptStatus && (
                    <p className="text-xs font-mono uppercase tracking-widest text-inkMuted">
                      {acceptStatus}
                    </p>
                  )}
                </div>
              )}

            {result.valid && !result.revoked && (
              <div className="flex justify-end print:hidden">
                <button
                  onClick={() => window.print()}
                  className="border border-border bg-transparent px-6 py-2 text-xs font-medium uppercase tracking-widest hover:border-ink/50 transition-colors"
                >
                  Download PDF Receipt
                </button>
              </div>
            )}
          </div>
        )}

        {risk && <RiskBadge report={risk} />}
      </div>
    </main>
    {result && credential && <PrintReceipt credential={credential} result={result} risk={risk} issuerSigValid={issuerSigValid} />}
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="p-24 font-mono text-inkMuted">
          LOADING_VERIFICATION_ENGINE...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
