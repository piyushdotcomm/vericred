"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useSiwe } from "@/lib/use-siwe";
import {
  issueCredentialOnChain,
  revokeCredentialOnChain,
  checkIsIssuer,
  getPublicClient,
  signIssuerAttestation,
  getTokenIdByHash,
  CONTRACT_ADDRESS,
} from "@/lib/contract-client";
import { credentialHashBytes32 } from "@/lib/hash";
import { parseAbiItem, type Address } from "viem";
import type { Credential, DocType } from "@/lib/types";
import Tesseract from "tesseract.js";

import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable, DataTableHeader, DataTableRow, DataTableHead, DataTableCell } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldAlert, FileText, Upload, History, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { motion } from "motion/react";

interface IssuedRow {
  credential: Credential;
  tokenId: number;
  revoked: boolean;
  cid: string;
}

interface ActivityLog {
  type: "ISSUED" | "REVOKED" | "PRESENTED" | "ACCEPTED";
  name: string;
  tx: string;
  blockNumber: number;
}

export default function IssuerPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { signIn, signingIn } = useSiwe();
  const { toast } = useToast();
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [course, setCourse] = useState("");
  const [docType, setDocType] = useState<DocType>("degree");
  const [isIssuing, setIsIssuing] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  const [issued, setIssued] = useState<IssuedRow[]>([]);
  const [isRevoking, setIsRevoking] = useState<number | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const fetchIssued = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch("/api/credentials");
      if (!res.ok) return;
      const all: (Credential & { tokenId?: number; cid?: string })[] = await res.json();
      const mine = all.filter((c) =>
        c.issuerDid.toLowerCase().includes(address.toLowerCase()),
      );

      const rows = await Promise.all(
        mine.map(async (c) => {
          const tokenId = c.tokenId ?? 0;
          const onchain = await getPublicClient().readContract({
            address: CONTRACT_ADDRESS,
            abi: [{
                type: "function",
                name: "getCredential",
                inputs: [{ name: "tokenId", type: "uint256" }],
                outputs: [
                  {
                    name: "",
                    type: "tuple",
                    components: [
                      { name: "issuer", type: "address" },
                      { name: "student", type: "address" },
                      { name: "docHash", type: "bytes32" },
                      { name: "docType", type: "string" },
                      { name: "cid", type: "string" },
                      { name: "issuedAt", type: "uint256" },
                      { name: "revoked", type: "bool" },
                      { name: "migrationStatus", type: "uint8" },
                      { name: "presentedTo", type: "address" },
                    ],
                  },
                ],
                stateMutability: "view",
              }],
            functionName: "getCredential",
            args: [BigInt(tokenId)],
          });
          return {
            credential: c,
            tokenId,
            revoked: Boolean((onchain as { revoked: boolean }).revoked),
            cid: (onchain as { cid: string }).cid,
          };
        }),
      );

      setIssued(rows.reverse());
    } catch (e) {
      console.error("Error fetching issued:", e);
    }
  }, [address]);

  const fetchActivity = useCallback(async () => {
    if (!address) return;
    try {
      const client = getPublicClient();
      const [issueLogs, revokeLogs, acceptLogs, presentLogs] = await Promise.all([
        client.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event CredentialIssued(uint256 indexed tokenId, address indexed issuer, address indexed student, bytes32 docHash, string docType)",
          ),
          fromBlock: BigInt(11541000),
        }),
        client.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event CredentialRevoked(uint256 indexed tokenId, address indexed issuer)",
          ),
          fromBlock: BigInt(11541000),
        }),
        client.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event MigrationAccepted(uint256 indexed tokenId, address indexed issuer, address indexed destination)",
          ),
          fromBlock: BigInt(11541000),
        }),
        client.getLogs({
          address: CONTRACT_ADDRESS,
          event: parseAbiItem(
            "event MigrationPresented(uint256 indexed tokenId, address indexed student, address indexed destination)",
          ),
          fromBlock: BigInt(11541000),
        }),
      ]);

      const combined: ActivityLog[] = [
        ...issueLogs.map((l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "ISSUED" as const,
          name: "Issued Credential",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        })),
        ...revokeLogs.map((l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "REVOKED" as const,
          name: "Revoked Credential",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        })),
        ...acceptLogs.map((l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "ACCEPTED" as const,
          name: "Accepted Migration",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        })),
        ...presentLogs.map((l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "PRESENTED" as const,
          name: "Presented Migration",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        })),
      ].sort((a, b) => b.blockNumber - a.blockNumber);

      setActivityLogs(combined);
    } catch (e) {
      console.error("Error fetching activity:", e);
    }
  }, [address]);

  useEffect(() => {
    if (!isConnected || !address) return;
    checkIsIssuer(address as Address).then(setIsAuthorized);
    fetchIssued();
    fetchActivity();
  }, [isConnected, address, fetchIssued, fetchActivity]);

  async function revoke(tokenId: number) {
    if (!confirm("Are you sure you want to permanently revoke this credential?")) return;
    if (!walletClient || !address) return;
    setIsRevoking(tokenId);
    toast("Initiating revocation...", "info");
    try {
      const tx = await revokeCredentialOnChain(walletClient, address as Address, tokenId);
      toast(`Revoked! Tx: ${tx.slice(0, 10)}...`, "success");
      await Promise.all([fetchIssued(), fetchActivity()]);
    } catch (e: any) {
      toast("Failed to revoke: " + e.message, "error");
    } finally {
      setIsRevoking(null);
    }
  }

  async function handleOcrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrScanning(true);
    toast("AI OCR Engine Scanning Document...", "info");

    try {
      const { data: { text } } = await Tesseract.recognize(file, "eng");
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      let parsedName = "";
      let parsedCourse = "";

      lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (lower.includes("name") || lower.includes("student")) {
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) parsedName = parts[1].trim();
        } else if (lower.includes("course") || lower.includes("program") || lower.includes("degree")) {
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) parsedCourse = parts[1].trim();
        }
      });

      if (!parsedName && lines.length > 0) parsedName = lines[0];
      if (!parsedCourse && lines.length > 1) parsedCourse = lines[1];

      if (parsedName) setStudentName(parsedName);
      if (parsedCourse) setCourse(parsedCourse);

      toast("OCR Scan Complete! Please review fields.", "success");
    } catch (err: any) {
      toast("OCR Failed: " + err.message, "error");
    } finally {
      setIsOcrScanning(false);
    }
  }

  async function issue() {
    if (!studentName || !course || !studentAddress || !address || !walletClient) return;
    setIsIssuing(true);
    toast("Signing in to Ethereum...", "info");

    const signedIn = await signIn();
    if (!signedIn) {
      toast("Error: SIWE sign-in failed.", "error");
      setIsIssuing(false);
      return;
    }

    toast("Waiting for wallet confirmation...", "info");

    try {
      const newCred: Credential = {
        id: `cred-${Date.now()}`,
        issuerDid: `did:web:issuer-${address.toLowerCase()}`,
        issuerName: "University Dashboard",
        studentName,
        studentAddress: studentAddress.toLowerCase(),
        rollNumber: `R-${Math.floor(Math.random() * 10000)}`,
        course,
        docType,
        issuedAt: new Date().toISOString(),
        claims: { program: course },
      };

      let cid = `ipfs://demo-${newCred.id}`;
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCred),
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          cid = data.cid;
        }
      } catch {}

      const issuerSignature = await signIssuerAttestation(walletClient, address as Address, newCred, cid);
      const txHash = await issueCredentialOnChain(walletClient, address as Address, newCred, studentAddress as Address, cid);
      const tokenId = await getTokenIdByHash(credentialHashBytes32(newCred));

      await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: newCred,
          cid,
          issuerSignature,
          docHash: credentialHashBytes32(newCred),
          tokenId: tokenId ? Number(tokenId) : 0,
        }),
      });

      toast(`Success! Transaction: ${txHash.slice(0, 10)}...`, "success");
      setStudentName("");
      setStudentAddress("");
      setCourse("");
      await Promise.all([fetchIssued(), fetchActivity()]);
    } catch (err: any) {
      toast(`Error: ${err.message || "Issuance failed"}`, "error");
    } finally {
      setIsIssuing(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <EmptyState 
          icon={User}
          title="Wallet Not Connected"
          description="Connect your institutional wallet using the button in the bottom left to access the dashboard."
        />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <ShieldAlert className="w-16 h-16 text-tampered mb-6" />
        <h2 className="text-2xl font-serif text-ink mb-2">Access Denied</h2>
        <p className="text-inkSecondary text-center max-w-md">
          This wallet does not hold the ISSUER_ROLE on the credential registry. Please connect the registered institutional wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-ink mb-2">Issuer Overview</h1>
        <p className="text-inkSecondary">Manage credentials, issue new assets, and view activity logs.</p>
      </div>

      {/* Top Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Issued (On-Chain)" value={issued.length} trend="+2 this week" />
        <MetricCard label="Revoked Credentials" value={issued.filter(i => i.revoked).length} />
        <MetricCard label="Active Network Verifications" value={activityLogs.filter(l => l.type === "ACCEPTED" || l.type === "PRESENTED").length} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Issuance Form (Left Column) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-1 space-y-6"
          id="issue"
        >
          <div className="bg-surface border border-border rounded-soft p-6 shadow-sm">
            <h2 className="font-serif text-xl mb-6">Issue New Asset</h2>
            
            {/* AI OCR Upload */}
            <div className="mb-6 p-4 border border-dashed border-border rounded-sm bg-surfaceAlt/50 text-center relative overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                onChange={handleOcrUpload}
                disabled={isOcrScanning}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Upload className="w-5 h-5 mx-auto text-inkMuted group-hover:text-ink transition-colors mb-2" />
              <p className="text-sm font-medium text-ink">Auto-fill with AI OCR</p>
              <p className="text-xs text-inkMuted mt-1">Upload an image of a legacy document</p>
              {isOcrScanning && (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center z-20">
                  <p className="text-sm font-mono text-accent animate-pulse">Scanning...</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="eyebrow block mb-2">Student Name</label>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aisha Verma"
                  className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="eyebrow block mb-2">Student Wallet Address</label>
                <input
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="eyebrow block mb-2">Program / Course</label>
                <input
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="eyebrow block mb-2">Asset Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full border border-border bg-background rounded-sm px-4 py-2.5 text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors appearance-none"
                >
                  <option value="degree">Degree Certificate</option>
                  <option value="transcript">Transcript</option>
                  <option value="migration">Migration Certificate</option>
                </select>
              </div>

              <Button 
                variant="primary" 
                onClick={issue} 
                disabled={isIssuing || !studentName || !studentAddress || !course}
                className="w-full mt-4"
              >
                {isIssuing ? "Signing..." : "Sign & Mint Asset"}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tables (Right Column) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Issued Credentials */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-border rounded-soft shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-serif text-xl">Issued Credentials</h2>

          <div className="border border-border bg-surface p-8 relative mt-12">
            <h2 className="text-xl font-medium tracking-tight uppercase mb-8">
              Issued Credentials Dashboard
            </h2>
            <div className="space-y-4">
              {issued.length === 0 ? (
                <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
                  NO_CREDENTIALS_ISSUED_YET
                </p>
              ) : (
                issued.map((row) => (
                  <div
                    key={row.credential.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border bg-background gap-4"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {row.credential.studentName}{" "}
                        <span className="text-inkMuted ml-2">
                          ({row.credential.claims.program})
                        </span>
                      </p>
                      <p className="font-mono text-[10px] text-inkMuted uppercase tracking-widest mt-1">
                        TOKEN: {row.tokenId} · {row.credential.docType}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {row.revoked ? (
                        <span className="font-mono text-xs text-tampered uppercase tracking-widest px-3 py-1 bg-tamperedBg border border-tampered">
                          REVOKED
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-valid uppercase tracking-widest px-3 py-1 bg-validBg border border-valid">
                          ACTIVE
                        </span>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(row.credential, null, 2));
                          alert('Credential JSON copied to clipboard! Paste it in the Verify Asset page.');
                        }}
                        className="bg-transparent border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-valid hover:text-valid transition-colors"
                      >
                        Copy JSON
                      </button>
                      <button
                        onClick={() => revoke(row.tokenId)}
                        disabled={row.revoked || isRevoking === row.tokenId}
                        className="bg-transparent border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-tampered hover:text-tampered disabled:opacity-50 transition-colors"
                      >
                        {isRevoking === row.tokenId ? "..." : "Revoke"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {issued.length === 0 ? (
              <EmptyState 
                icon={FileText} 
                title="No Credentials Issued" 
                description="Use the issuance form to create your first on-chain credential."
                className="border-0 rounded-none bg-transparent"
              />
            ) : (
              <DataTable>
                <DataTableHeader>
                  <tr>
                    <DataTableHead>Student</DataTableHead>
                    <DataTableHead>Type</DataTableHead>
                    <DataTableHead>Status</DataTableHead>
                    <DataTableHead className="text-right">Actions</DataTableHead>
                  </tr>
                </DataTableHeader>
                <tbody>
                  {issued.map((row) => (
                    <DataTableRow key={row.credential.id}>
                      <DataTableCell>
                        <p className="font-medium text-ink">{row.credential.studentName}</p>
                        <p className="text-inkMuted text-xs mt-0.5">{row.credential.claims.program}</p>
                      </DataTableCell>
                      <DataTableCell>
                        <span className="font-mono text-xs uppercase tracking-wider text-inkSecondary">{row.credential.docType}</span>
                      </DataTableCell>
                      <DataTableCell>
                        <StatusBadge status={row.revoked ? "REVOKED" : "ACTIVE"} />
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => revoke(row.tokenId)}
                          disabled={row.revoked || isRevoking === row.tokenId}
                          className="px-3 py-1.5 text-xs text-tampered hover:bg-tamperedBg"
                        >
                          {isRevoking === row.tokenId ? "..." : "Revoke"}
                        </Button>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>
            )}
          </motion.div>

          {/* Activity Log */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-border rounded-soft shadow-sm overflow-hidden" id="log"
          >
            <div className="p-6 border-b border-border">
              <h2 className="font-serif text-xl">Protocol Activity Log</h2>
            </div>
            {activityLogs.length === 0 ? (
               <EmptyState 
                icon={History} 
                title="No Activity" 
                description="On-chain activity will appear here."
                className="border-0 rounded-none bg-transparent"
              />
            ) : (
              <div className="divide-y divide-border">
                {activityLogs.map((log, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-surfaceAlt/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === "REVOKED" ? "bg-tampered" : log.type === "ISSUED" ? "bg-ink" : "bg-valid"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-ink">{log.name}</p>
                        <p className="text-xs text-inkMuted font-mono mt-1">Block: {log.blockNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-inkSecondary bg-surfaceAlt px-2 py-1 rounded-sm">
                        Tx: {log.tx.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
