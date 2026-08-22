"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { WalletConnect } from "@/components/wallet-connect";
import { CredentialCard } from "@/components/credential-card";
import {
  signGrant,
  tokensOfOwner,
  getCredentialOnChain,
  presentMigrationOnChain,
} from "@/lib/contract-client";
import type { Credential } from "@/lib/types";
import { QRCodeSVG } from "qrcode.react";
import type { Address } from "viem";

interface VaultCredential {
  credential: Credential;
  tokenId: number;
  migrationStatus: number;
  presentedTo: Address;
  docType: string;
  cid?: string;
  issuerSignature?: string;
}

export default function StudentPage() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [shared, setShared] = useState<Record<string, string>>({});
  const [credentials, setCredentials] = useState<VaultCredential[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sharingCredId, setSharingCredId] = useState<string | null>(null);
  const [expiryHours, setExpiryHours] = useState(24);
  const [verifierAddress, setVerifierAddress] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [grantSignatures, setGrantSignatures] = useState<
    Record<string, string>
  >({});
  const [presentingCredId, setPresentingCredId] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState("");

  const fetchVault = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      // Real on-chain indexer: read the SBTs owned by this wallet.
      const tokenIds = await tokensOfOwner(address as Address);

      // Fetch the metadata cache once (instead of per token).
      const res = await fetch("/api/credentials");
      const all: (Credential & {
        tokenId?: number;
        cid?: string;
        issuerSignature?: string;
      })[] = await res.json();

      const onchain = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const c = await getCredentialOnChain(tokenId);
          const local = all.find((r) => r.tokenId === Number(tokenId));

          const credential: Credential =
            local ??
            ({
              id: `cred-${Number(tokenId)}`,
              issuerDid: `did:web:issuer-${c.issuer.toLowerCase()}`,
              issuerName: "University",
              studentName: "Holder",
              studentAddress: c.student.toLowerCase(),
              rollNumber: "-",
              course: c.docType,
              docType: c.docType as Credential["docType"],
              issuedAt: new Date(Number(c.issuedAt) * 1000).toISOString(),
              claims: {},
            } as Credential);

          return {
            credential,
            tokenId: Number(tokenId),
            migrationStatus: c.migrationStatus,
            presentedTo: c.presentedTo,
            docType: c.docType,
            cid: local?.cid,
            issuerSignature: local?.issuerSignature,
          };
        }),
      );

      setCredentials(onchain);

      const logRes = await fetch(
        `/api/access-logs?student=${address}`,
      ).catch(() => null);
      const logs = logRes ? await logRes.json() : [];
      setAccessLogs(logs.reverse());
    } catch (e) {
      console.error("Failed to fetch vault", e);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnected || !address) {
      setCredentials([]);
      setAccessLogs([]);
      setOtpVerified(false);
      return;
    }
    fetch("/api/kyc/status").then(res => res.json()).then(data => {
      if (data.verified && data.address === address.toLowerCase()) {
        setOtpVerified(true);
        fetchVault();
      }
    });
  }, [isConnected, address, fetchVault]);

  async function generateGrant(vc: VaultCredential) {
    if (!walletClient || !address) return;
    try {
      const verifier = (verifierAddress || "0x0000000000000000000000000000000000000000") as Address;
      const expiresAt = Math.floor(Date.now() / 1000) + expiryHours * 3600;
      const signature = await signGrant(
        walletClient,
        address as Address,
        verifier,
        vc.credential.id,
        expiresAt,
      );

      const payloadObj = {
        credential: vc.credential,
        cid: vc.cid ?? "",
        issuerSignature: vc.issuerSignature ?? "",
        grant: {
          verifier,
          credentialId: vc.credential.id,
          expiresAt,
          signature,
        },
      };

      const payload = btoa(JSON.stringify(payloadObj));
      const url = `${window.location.origin}/verify?c=${payload}`;
      setShared((prev) => ({ ...prev, [vc.credential.id]: url }));
      setGrantSignatures((prev) => ({ ...prev, [vc.credential.id]: signature }));
      setSharingCredId(null);
    } catch (e: any) {
      alert("Failed to sign grant: " + e.message);
    }
  }

  async function revokeGrant(credentialId: string) {
    const signature = grantSignatures[credentialId];
    if (!signature) return;

    try {
      await fetch("/api/revoke-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      setShared((prev) => {
        const next = { ...prev };
        delete next[credentialId];
        return next;
      });
      alert(
        "Grant successfully revoked! Anyone scanning this QR code will now be denied access.",
      );
    } catch (e: any) {
      alert("Failed to revoke grant: " + e.message);
    }
  }

  async function presentMigration(vc: VaultCredential) {
    if (!destinationAddress || !walletClient || !address) return;
    try {
      const tx = await presentMigrationOnChain(
        walletClient,
        address as Address,
        vc.tokenId,
        destinationAddress as Address,
      );
      alert(`Migration presented! Tx: ${tx.slice(0, 10)}...`);
      setPresentingCredId(null);
      setDestinationAddress("");
      await fetchVault();
    } catch (e: any) {
      alert("Failed to present migration: " + e.message);
    }
  }

  const migrationLabel = (status: number) =>
    ["none", "issued", "presented", "accepted"][status] ?? "unknown";

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 flex flex-col min-h-screen">
      <header className="flex items-center justify-between mb-12">
        <a
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-inkMuted hover:text-ink transition-colors"
        >
          &larr; Back to protocol
        </a>
        <WalletConnect />
      </header>

      <h1 className="mt-6 text-4xl md:text-5xl font-sans tracking-tighter uppercase">
        Holder <span className="text-inkMuted">Vault</span>
      </h1>

      {!isConnected ? (
        <div className="mt-8 border border-border bg-surface p-8">
          <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
            // STATUS: UNAUTHORIZED
          </p>
          <p className="mt-4 text-inkMuted max-w-md">
            Connect your wallet to access cryptographically bound credentials
            issued to your address.
          </p>
        </div>
      ) : !otpVerified ? (
        <div className="mt-8 border border-border bg-surface p-8 relative">
          <p className="font-mono text-xs text-tampered uppercase tracking-widest mb-4">
            // IDENTITY_VERIFICATION_REQUIRED
          </p>
          <h2 className="text-xl font-medium tracking-tight uppercase mb-4">
            Simulated Aadhaar e-KYC / OTP
          </h2>
          <p className="text-inkMuted max-w-md mb-6 text-sm">
            To securely bind this wallet to your academic identity, please enter
            the OTP sent to your university-registered mobile number.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-sm">
            <div className="flex flex-col gap-4 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter university email"
                className="border border-border bg-background px-4 py-2 text-sm flex-1"
              />
              <div className="flex gap-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP (hint: 123456)"
                  className="border border-border bg-background px-4 py-2 text-sm uppercase tracking-widest flex-1"
                />
                <button
                  onClick={async () => {
                    const res = await fetch("/api/kyc/verify", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ address, email, otp })
                    });
                    if (res.ok) {
                      setOtpVerified(true);
                      fetchVault();
                    } else {
                      alert("Invalid OTP or email");
                    }
                  }}
                  className="bg-ink text-background px-6 py-2 text-sm font-medium uppercase tracking-widest hover:opacity-90 whitespace-nowrap"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          <div className="border-b border-border pb-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted">
              CONNECTED_ADDRESS
            </p>
            <p className="font-mono text-sm text-ink mt-1 truncate">
              {address}
            </p>
          </div>

          {isLoading ? (
            <p className="font-mono text-xs text-inkMuted uppercase tracking-widest animate-pulse">
              SYNCING_LEDGER...
            </p>
          ) : credentials.length === 0 ? (
            <div className="border border-border p-8 border-dashed bg-surface/50">
              <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
                NO_ASSETS_FOUND
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {credentials.map((vc) => (
                <div key={vc.credential.id} className="group relative">
                  <CredentialCard
                    credential={vc.credential}
                    status="VALID"
                  />
                  {vc.docType === "migration" && (
                    <div className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-inkMuted">
                      MIGRATION_STATUS:{" "}
                      <span className="text-ink">
                        {migrationLabel(vc.migrationStatus)}
                      </span>
                      {vc.presentedTo &&
                        vc.presentedTo !==
                          "0x0000000000000000000000000000000000000000" && (
                          <span className="truncate">
                            → {vc.presentedTo.slice(0, 10)}...
                          </span>
                        )}
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-4">
                    {!shared[vc.credential.id] &&
                      sharingCredId !== vc.credential.id && (
                        <button
                          type="button"
                          onClick={() => setSharingCredId(vc.credential.id)}
                          className="border border-border bg-transparent px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:border-ink/50"
                        >
                          Generate Proof Link
                        </button>
                      )}
                    {vc.docType === "migration" &&
                      vc.migrationStatus === 1 && (
                        <button
                          type="button"
                          onClick={() => setPresentingCredId(vc.credential.id)}
                          className="border border-border bg-transparent px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:border-valid hover:text-valid"
                        >
                          Present to University
                        </button>
                      )}
                    {shared[vc.credential.id] && (
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(shared[vc.credential.id])
                        }
                        className="bg-accent text-background px-6 py-2.5 text-xs font-medium uppercase tracking-widest transition-transform hover:-translate-y-[1px] active:translate-y-0"
                      >
                        Copy Link
                      </button>
                    )}
                  </div>

                  {sharingCredId === vc.credential.id && (
                    <div className="mt-6 p-6 border border-border bg-surface flex flex-col gap-4">
                      <p className="font-mono text-xs uppercase tracking-widest text-inkMuted">
                        Configure Access Grant
                      </p>
                      <div>
                        <label className="text-sm">Verifier address (blank = bearer)</label>
                        <input
                          type="text"
                          value={verifierAddress}
                          onChange={(e) => setVerifierAddress(e.target.value)}
                          placeholder="0x..."
                          className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="text-sm">Expires in (hours):</label>
                        <input
                          type="number"
                          min={1}
                          max={720}
                          value={expiryHours}
                          onChange={(e) =>
                            setExpiryHours(Number(e.target.value))
                          }
                          className="border border-border bg-background px-3 py-1 w-24 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => generateGrant(vc)}
                        className="bg-ink text-background px-6 py-2.5 text-xs font-medium uppercase tracking-widest hover:opacity-90 self-start"
                      >
                        Sign & Generate QR
                      </button>
                    </div>
                  )}

                  {presentingCredId === vc.credential.id && (
                    <div className="mt-6 p-6 border border-border bg-surface flex flex-col gap-4">
                      <p className="font-mono text-xs uppercase tracking-widest text-inkMuted">
                        Present Migration to Destination University
                      </p>
                      <input
                        type="text"
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        placeholder="Destination university wallet address (0x...)"
                        className="w-full border border-border bg-background px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => presentMigration(vc)}
                        className="bg-ink text-background px-6 py-2.5 text-xs font-medium uppercase tracking-widest hover:opacity-90 self-start"
                      >
                        Sign & Present
                      </button>
                    </div>
                  )}

                  {shared[vc.credential.id] && (
                    <div className="mt-6 p-6 border border-border bg-background inline-flex flex-col items-center gap-4">
                      <p className="font-mono text-xs uppercase tracking-widest text-inkMuted">
                        Scan to Verify (Expires {expiryHours}h)
                      </p>
                      <div className="bg-white p-4">
                        <QRCodeSVG
                          value={shared[vc.credential.id]}
                          size={160}
                        />
                      </div>
                      <p className="text-xs text-inkMuted text-center max-w-[200px]">
                        This QR code contains a cryptographically signed grant.
                      </p>
                      <button
                        type="button"
                        onClick={() => revokeGrant(vc.credential.id)}
                        className="mt-2 text-xs font-mono uppercase tracking-widest text-tampered hover:opacity-80 transition-opacity"
                      >
                        [ Revoke Access Link ]
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {credentials.length > 0 && (
            <div className="mt-16 border-t border-border pt-12">
              <h2 className="text-xl font-medium tracking-tight uppercase mb-8">
                Verification Access Logs
              </h2>
              <div className="space-y-4">
                {accessLogs.length === 0 ? (
                  <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
                    NO_ACCESS_HISTORY_FOUND
                  </p>
                ) : (
                  accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border border-border bg-surface flex flex-col md:flex-row md:justify-between md:items-center gap-4"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          Credential ID: {log.credentialId}
                        </p>
                        <p className="font-mono text-xs text-inkMuted uppercase tracking-widest mt-1">
                          Verifier: {log.verifierAddress}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="font-mono text-[10px] text-inkMuted uppercase tracking-widest block mb-1">
                          ACCESSED AT
                        </span>
                        <p className="text-sm font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
