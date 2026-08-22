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

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle, FileSearch, Download, ArrowRight, Server, ShieldCheck, Cpu } from "lucide-react";

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
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [risk, setRisk] = useState<RiskReport | null>(null);
  const [issuerSigValid, setIssuerSigValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<number>(0);

  async function acceptMigration() {
    if (!credential || !isConnected || !address || tokenId === null || !walletClient) return;
    setIsAccepting(true);
    toast("Confirm transaction in your wallet...", "info");
    try {
      const tx = await acceptMigrationOnChain(walletClient, address as Address, tokenId, address as Address);
      toast(`Migration Accepted! Tx: ${tx.slice(0, 10)}...`, "success");
      setMigrationStatus(3); // Accepted
    } catch (e: any) {
      toast("Error accepting migration: " + e.message, "error");
    } finally {
      setIsAccepting(false);
    }
  }

  async function runVerification(raw: string) {
    if (!raw.trim()) return;
    setError("");
    setResult(null);
    setCredential(null);
    setRisk(null);
    setIssuerSigValid(null);
    setTokenId(null);
    setMigrationStatus(0);
    setIsLoading(true);

    try {
      let parsedPayload: any;
      try {
        parsedPayload = JSON.parse(raw);
      } catch {
        throw new Error("Invalid format. Please paste valid credential JSON.");
      }

      let parsedCred: Credential;
      let grant: GrantPayload | undefined;

      if (parsedPayload.grant && parsedPayload.credential) {
        parsedCred = parsedPayload.credential;
        grant = parsedPayload.grant as GrantPayload;

        if (Math.floor(Date.now() / 1000) > grant.expiresAt) {
          throw new Error("ACCESS DENIED: This credential grant has expired.");
        }

        const revokeRes = await fetch(`/api/revoke-grant?signature=${encodeURIComponent(grant.signature)}`);
        const revokeData = await revokeRes.json();
        if (revokeData.isRevoked) {
          throw new Error("ACCESS DENIED: The student has revoked this access link.");
        }

        const isValidSignature = await verifyGrantSignature(grant, parsedCred.studentAddress as Address);
        if (!isValidSignature) {
          throw new Error("ACCESS DENIED: Invalid or tampered grant signature.");
        }

        const isBearer = grant.verifier === "0x0000000000000000000000000000000000000000";
        if (!isBearer && (!isConnected || address !== grant.verifier)) {
          throw new Error("ACCESS DENIED: This grant is cryptographically bound to a specific verifier wallet.");
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

      const sig = (parsedPayload as any).issuerSignature;
      if (verification.valid && sig && sig !== "0x") {
        const valid = await verifyIssuerAttestation(parsedCred, (parsedPayload as any).cid ?? "", sig, verification.issuer as Address);
        setIssuerSigValid(valid);
      } else {
        setIssuerSigValid(null);
      }

      const stats = await fetchRegistryStats((verification.issuer as Address) ?? "0x0000000000000000000000000000000000000000");
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
      toast(err.message || "Verification failed", "error");
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

  const migrationLabel = (status: number) => ["None", "Issued", "Presented", "Accepted"][status] ?? "Unknown";

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 print:hidden min-h-screen flex flex-col">
        <header className="mb-12 flex justify-between items-center bg-surface/50 p-4 border border-border rounded-soft">
          <a
            href="/"
            className="font-mono text-xs uppercase tracking-widest text-inkSecondary hover:text-ink transition-colors flex items-center gap-2"
          >
            &larr; Back to protocol
          </a>
          <WalletConnect />
        </header>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full text-center"
            >
              <FileSearch className="w-16 h-16 text-accent mb-6" />
              <h1 className="text-4xl md:text-5xl font-serif text-ink mb-4">
                Verify Document
              </h1>
              <p className="text-inkSecondary max-w-xl mx-auto mb-12">
                Paste the credential JSON payload below to run a mathematically verifiable on-chain check against the VeriCred network. No accounts required.
              </p>

              <div className="w-full bg-surface border border-border rounded-soft p-6 shadow-sm text-left relative group">
                <label htmlFor="credential-json" className="eyebrow block mb-4">
                  Credential Payload
                </label>
                <textarea
                  id="credential-json"
                  rows={8}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='{"id":"cred-1","issuerName":"University A",...}'
                  className="w-full border border-border bg-background rounded-sm p-4 font-mono text-sm leading-relaxed text-ink focus:border-ink/50 focus:outline-none transition-colors resize-none placeholder:text-border"
                />
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="primary"
                    onClick={() => runVerification(input)}
                    disabled={isLoading || !input}
                    className="w-full sm:w-auto px-8"
                  >
                    {isLoading ? "Verifying Ledger..." : "Run Verification"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const demo = JSON.stringify(demoCredential, null, 2);
                      setInput(demo);
                      runVerification(demo);
                    }}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Load Demo Asset
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
            >
              {/* Left Column: Result & Document Preview */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-border pb-6">
                  <button 
                    onClick={() => {
                      setResult(null);
                      setCredential(null);
                    }}
                    className="w-10 h-10 flex items-center justify-center border border-border rounded-full hover:bg-surfaceAlt transition-colors"
                  >
                    &larr;
                  </button>
                  <div>
                    <h2 className="text-2xl font-serif">Verification Results</h2>
                    <p className="text-sm text-inkSecondary font-mono mt-1">ID: {credential?.id}</p>
                  </div>
                </div>

                <CredentialCard
                  credential={credential!}
                  status={result.valid ? (result.revoked ? "REVOKED" : "VALID") : "TAMPERED"}
                />

                {result.valid && !result.revoked && credential?.docType.toLowerCase() === "migration" && (
                  <div className="p-6 border border-border bg-surface rounded-soft shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-serif text-lg">Destination University Action</h3>
                      <p className="text-sm text-inkSecondary mt-1">
                        Migration status: <span className="font-semibold text-ink">{migrationLabel(migrationStatus)}</span>
                      </p>
                    </div>
                    {migrationStatus === 2 && (
                      !isConnected ? (
                        <p className="text-xs font-mono text-tampered border border-tampered bg-tamperedBg px-3 py-1.5 rounded-sm">
                          CONNECT WALLET TO ACCEPT
                        </p>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={acceptMigration}
                          disabled={isAccepting}
                        >
                          {isAccepting ? "Processing..." : "Accept Migration"}
                        </Button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Verification Checklist & Risk */}
              <div className="space-y-6 lg:sticky lg:top-8">
                <h3 className="font-serif text-xl border-b border-border pb-4">Consensus Checklist</h3>
                
                <div className="space-y-4">
                  {/* Cryptographic Hash Check */}
                  <div className="p-4 border border-border rounded-soft bg-surface flex items-start gap-4">
                    <div className="mt-1">
                      {result.valid ? <CheckCircle2 className="w-5 h-5 text-valid" /> : <XCircle className="w-5 h-5 text-tampered" />}
                    </div>
                    <div>
                      <p className="font-medium">Cryptographic Hash Verification</p>
                      <p className="text-sm text-inkSecondary mt-1">
                        {result.valid 
                          ? "The provided document payload matches the cryptographic hash anchored on the blockchain."
                          : "The document payload has been modified and does NOT match the on-chain hash."}
                      </p>
                    </div>
                  </div>

                  {/* Issuer Registry Check */}
                  <div className="p-4 border border-border rounded-soft bg-surface flex items-start gap-4">
                    <div className="mt-1">
                      {result.valid ? <ShieldCheck className="w-5 h-5 text-valid" /> : <XCircle className="w-5 h-5 text-tampered" />}
                    </div>
                    <div>
                      <p className="font-medium">Issuer Identity Registry</p>
                      <p className="text-sm text-inkSecondary mt-1">
                        {result.valid
                          ? `Issued by recognized entity: ${result.issuerName} (${result.issuer?.slice(0,8)}...)`
                          : "Unknown or unauthorized issuer identity."}
                      </p>
                    </div>
                  </div>

                  {/* Revocation Check */}
                  <div className="p-4 border border-border rounded-soft bg-surface flex items-start gap-4">
                    <div className="mt-1">
                      {!result.valid ? <XCircle className="w-5 h-5 text-inkMuted" /> : result.revoked ? <XCircle className="w-5 h-5 text-revoked" /> : <CheckCircle2 className="w-5 h-5 text-valid" />}
                    </div>
                    <div>
                      <p className="font-medium">Revocation Status</p>
                      <p className="text-sm text-inkSecondary mt-1">
                        {!result.valid ? "N/A" : result.revoked ? "This credential was explicitly revoked by the issuer and is no longer valid." : "Credential is active and has not been revoked."}
                      </p>
                    </div>
                  </div>

                  {/* EIP-712 Signature */}
                  {issuerSigValid !== null && (
                    <div className="p-4 border border-border rounded-soft bg-surface flex items-start gap-4">
                      <div className="mt-1">
                        {issuerSigValid ? <CheckCircle2 className="w-5 h-5 text-valid" /> : <XCircle className="w-5 h-5 text-tampered" />}
                      </div>
                      <div>
                        <p className="font-medium">EIP-712 Attestation Signature</p>
                        <p className="text-sm text-inkSecondary mt-1">
                          {issuerSigValid ? "Cryptographically verifiable signature from the issuer's private key is valid." : "Invalid signature from the issuer."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Risk Score */}
                {risk && (
                  <div className="pt-4">
                    <RiskBadge report={risk} />
                  </div>
                )}

                {/* Print Action */}
                {result.valid && !result.revoked && (
                  <div className="pt-6">
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => window.print()}
                    >
                      <Download className="w-4 h-4" /> Download Official Receipt
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {result && credential && (
        <PrintReceipt credential={credential} result={result} risk={risk} issuerSigValid={issuerSigValid} />
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-inkMuted text-sm tracking-widest uppercase animate-pulse">
          Loading Verification Engine...
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
