"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
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

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable, DataTableHeader, DataTableRow, DataTableHead, DataTableCell } from "@/components/ui/data-table";
import { ShieldCheck, Fingerprint, Activity, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { motion } from "motion/react";

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
  const { toast } = useToast();

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
  const [grantSignatures, setGrantSignatures] = useState<Record<string, string>>({});
  const [presentingCredId, setPresentingCredId] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState("");

  const fetchVault = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const tokenIds = await tokensOfOwner(address as Address);
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

      const logRes = await fetch(`/api/access-logs?student=${address}`).catch(() => null);
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
      const signature = await signGrant(walletClient, address as Address, verifier, vc.credential.id, expiresAt);

      const payloadObj = {
        credential: vc.credential,
        cid: vc.cid ?? "",
        issuerSignature: vc.issuerSignature ?? "",
        grant: { verifier, credentialId: vc.credential.id, expiresAt, signature },
      };

      const payload = btoa(JSON.stringify(payloadObj));
      const url = `${window.location.origin}/verify?c=${payload}`;
      setShared((prev) => ({ ...prev, [vc.credential.id]: url }));
      setGrantSignatures((prev) => ({ ...prev, [vc.credential.id]: signature }));
      setSharingCredId(null);
      toast("Access grant generated successfully.", "success");
    } catch (e: any) {
      toast("Failed to sign grant: " + e.message, "error");
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
      toast("Grant successfully revoked! Scanning the QR code will now be denied.", "success");
    } catch (e: any) {
      toast("Failed to revoke grant: " + e.message, "error");
    }
  }

  async function presentMigration(vc: VaultCredential) {
    if (!destinationAddress || !walletClient || !address) return;
    try {
      const tx = await presentMigrationOnChain(walletClient, address as Address, vc.tokenId, destinationAddress as Address);
      toast(`Migration presented! Tx: ${tx.slice(0, 10)}...`, "success");
      setPresentingCredId(null);
      setDestinationAddress("");
      await fetchVault();
    } catch (e: any) {
      toast("Failed to present migration: " + e.message, "error");
    }
  }

  const migrationLabel = (status: number) => ["None", "Issued", "Presented", "Accepted"][status] ?? "Unknown";

  if (!isConnected) {
    return (
      <main className="p-8 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <EmptyState 
          icon={User}
          title="Wallet Not Connected"
          description="Connect your wallet using the button in the top right to access your academic vault."
        />
      </main>
    );
  }

  if (!otpVerified) {
    return (
      <main className="p-8 min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface border border-border p-8 rounded-soft shadow-sm"
        >
          <div className="flex justify-center mb-6 text-accent">
            <Fingerprint className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-serif text-center mb-2">Simulated Aadhaar e-KYC</h2>
          <p className="text-inkSecondary text-center text-sm mb-8">
            To securely bind this wallet to your academic identity, please enter the OTP sent to your university-registered mobile number.
          </p>

          <div className="space-y-4">
            <div>
              <label className="eyebrow block mb-2">University Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink focus:border-ink/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink uppercase tracking-widest focus:border-ink/50 focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              className="w-full mt-2"
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
                  toast("Invalid OTP or email", "error");
                }
              }}
            >
              Verify Identity
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-serif text-ink mb-2">My Vault</h1>
        <p className="text-inkSecondary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-valid" /> Cryptographically bound to {address?.slice(0,6)}...{address?.slice(-4)}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <p className="font-mono text-sm text-inkMuted uppercase tracking-widest animate-pulse">
            Syncing Ledger...
          </p>
        </div>
      ) : credentials.length === 0 ? (
        <EmptyState 
          icon={ShieldCheck} 
          title="No Assets Found" 
          description="Your wallet does not currently hold any verifiable academic credentials."
        />
      ) : (
        <div className="space-y-12">
          {credentials.map((vc) => (
            <motion.div 
              key={vc.credential.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <CredentialCard credential={vc.credential} status="VALID" />
              
              {vc.docType === "migration" && (
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-inkSecondary bg-surfaceAlt px-4 py-2 rounded-sm w-fit border border-border">
                  MIGRATION STATUS: <span className="text-ink font-semibold">{migrationLabel(vc.migrationStatus)}</span>
                  {vc.presentedTo && vc.presentedTo !== "0x0000000000000000000000000000000000000000" && (
                    <span className="truncate"> → {vc.presentedTo.slice(0, 10)}...</span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {!shared[vc.credential.id] && sharingCredId !== vc.credential.id && (
                  <Button variant="outline" onClick={() => setSharingCredId(vc.credential.id)}>
                    Generate Proof Link
                  </Button>
                )}
                
                {vc.docType === "migration" && vc.migrationStatus === 1 && (
                  <Button variant="outline" onClick={() => setPresentingCredId(vc.credential.id)}>
                    Present to University
                  </Button>
                )}
                
                {shared[vc.credential.id] && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(shared[vc.credential.id]);
                      toast("Link copied to clipboard!", "success");
                    }}
                  >
                    Copy Link
                  </Button>
                )}
              </div>

              {sharingCredId === vc.credential.id && (
                <div className="p-6 border border-border rounded-soft bg-surface space-y-4 max-w-lg">
                  <p className="eyebrow">Configure Access Grant</p>
                  <div>
                    <label className="block text-sm mb-1 text-inkSecondary">Verifier Address (leave blank for bearer token)</label>
                    <input
                      type="text"
                      value={verifierAddress}
                      onChange={(e) => setVerifierAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full border border-border bg-background rounded-sm px-4 py-2 text-sm focus:border-ink/50 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-inkSecondary">Expires in (hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="border border-border bg-background rounded-sm px-4 py-2 w-32 text-sm focus:border-ink/50 focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                     <Button variant="primary" onClick={() => generateGrant(vc)}>Sign & Generate Link</Button>
                     <Button variant="ghost" onClick={() => setSharingCredId(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              {presentingCredId === vc.credential.id && (
                <div className="p-6 border border-border rounded-soft bg-surface space-y-4 max-w-lg">
                  <p className="eyebrow">Present Migration</p>
                  <div>
                    <label className="block text-sm mb-1 text-inkSecondary">Destination University Address</label>
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full border border-border bg-background rounded-sm px-4 py-2 text-sm focus:border-ink/50 focus:outline-none"
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                     <Button variant="primary" onClick={() => presentMigration(vc)}>Sign & Present</Button>
                     <Button variant="ghost" onClick={() => setPresentingCredId(null)}>Cancel</Button>
                  </div>
                </div>
              )}

              {shared[vc.credential.id] && (
                <div className="p-6 border border-border rounded-soft bg-surfaceAlt/50 inline-flex flex-col items-center gap-4 text-center">
                  <p className="eyebrow">Scan to Verify (Expires {expiryHours}h)</p>
                  <div className="bg-white p-4 rounded-sm shadow-sm">
                    <QRCodeSVG value={shared[vc.credential.id]} size={160} />
                  </div>
                  <p className="text-xs text-inkSecondary max-w-[200px]">
                    This QR code contains a cryptographically signed grant.
                  </p>
                  <Button variant="ghost" onClick={() => revokeGrant(vc.credential.id)} className="text-tampered hover:bg-tamperedBg hover:text-tampered">
                    Revoke Access Link
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {credentials.length > 0 && (
        <div className="pt-8 border-t border-border mt-16">
          <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-inkSecondary" /> Verification Access Logs
          </h2>
          {accessLogs.length === 0 ? (
             <EmptyState 
              icon={Activity} 
              title="No Access History" 
              description="No one has accessed your credentials yet."
              className="bg-transparent border-0"
            />
          ) : (
            <div className="border border-border rounded-soft overflow-hidden">
              <DataTable>
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Date & Time</DataTableHead>
                    <DataTableHead>Credential</DataTableHead>
                    <DataTableHead>Verifier</DataTableHead>
                  </tr>
                </DataTableHeader>
                <tbody>
                  {accessLogs.map((log) => (
                    <DataTableRow key={log.id}>
                      <DataTableCell className="whitespace-nowrap">
                        <span className="text-ink font-medium text-sm">{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span className="text-inkMuted text-xs ml-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </DataTableCell>
                      <DataTableCell>
                        <span className="font-mono text-xs">{log.credentialId}</span>
                      </DataTableCell>
                      <DataTableCell>
                        <span className="font-mono text-xs text-inkSecondary bg-surfaceAlt px-2 py-1 rounded-sm">{log.verifierAddress.slice(0, 16)}...</span>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
