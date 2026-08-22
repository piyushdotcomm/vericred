"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { WalletConnect } from "@/components/wallet-connect";
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentAddress, setStudentAddress] = useState("");
  const [course, setCourse] = useState("");
  const [docType, setDocType] = useState<DocType>("degree");
  const [status, setStatus] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);
  const [isOcrScanning, setIsOcrScanning] = useState(false);

  const [issued, setIssued] = useState<IssuedRow[]>([]);
  const [isRevoking, setIsRevoking] = useState<number | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const fetchIssued = useCallback(async () => {
    if (!address) return;
    const res = await fetch("/api/credentials");
    const all: (Credential & { tokenId?: number; cid?: string })[] =
      await res.json();
    const mine = all.filter((c) =>
      c.issuerDid.toLowerCase().includes(address.toLowerCase()),
    );

    const rows = await Promise.all(
      mine.map(async (c) => {
        const tokenId = c.tokenId ?? 0;
        const onchain = await getPublicClient().readContract({
          address: CONTRACT_ADDRESS,
          abi: [
            {
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
            },
          ],
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
  }, [address]);

  const fetchActivity = useCallback(async () => {
    if (!address) return;
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
      ...issueLogs.map(
        (l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "ISSUED" as const,
          name: "Issued Credential",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        }),
      ),
      ...revokeLogs.map(
        (l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "REVOKED" as const,
          name: "Revoked Credential",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        }),
      ),
      ...acceptLogs.map(
        (l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "ACCEPTED" as const,
          name: "Accepted Migration",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        }),
      ),
      ...presentLogs.map(
        (l: { transactionHash: string; blockNumber: bigint | number }) => ({
          type: "PRESENTED" as const,
          name: "Presented Migration",
          tx: l.transactionHash,
          blockNumber: Number(l.blockNumber),
        }),
      ),
    ].sort((a, b) => b.blockNumber - a.blockNumber);

    setActivityLogs(combined);
  }, [address]);

  useEffect(() => {
    if (!isConnected || !address) return;
    checkIsIssuer(address as Address).then(setIsAuthorized);
    fetchIssued();
    fetchActivity();
  }, [isConnected, address, fetchIssued, fetchActivity]);

  async function revoke(tokenId: number) {
    if (!confirm("Are you sure you want to permanently revoke this credential?"))
      return;
    if (!walletClient || !address) return;
    setIsRevoking(tokenId);
    try {
      const tx = await revokeCredentialOnChain(
        walletClient,
        address as Address,
        tokenId,
      );
      setStatus(`Revoked! Tx: ${tx.slice(0, 10)}...`);
      setTimeout(() => setStatus(""), 5000);
      await Promise.all([fetchIssued(), fetchActivity()]);
    } catch (e: any) {
      alert("Failed to revoke: " + e.message);
    } finally {
      setIsRevoking(null);
    }
  }

  async function handleOcrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrScanning(true);
    setStatus("AI OCR Engine Scanning Document...");

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");

      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      let parsedName = "";
      let parsedCourse = "";

      lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (lower.includes("name") || lower.includes("student")) {
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) parsedName = parts[1].trim();
        } else if (
          lower.includes("course") ||
          lower.includes("program") ||
          lower.includes("degree")
        ) {
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) parsedCourse = parts[1].trim();
        }
      });

      if (!parsedName && lines.length > 0) parsedName = lines[0];
      if (!parsedCourse && lines.length > 1) parsedCourse = lines[1];

      if (parsedName) setStudentName(parsedName);
      if (parsedCourse) setCourse(parsedCourse);

      setStatus("OCR Scan Complete! Please review extracted fields.");
    } catch (err: any) {
      setStatus("OCR Failed: " + err.message);
    } finally {
      setIsOcrScanning(false);
    }
  }

  async function issue() {
    if (!studentName || !course || !studentAddress || !address || !walletClient)
      return;
    setIsIssuing(true);
    setStatus("Signing in to Ethereum...");

    // Persist metadata via the SIWE-authorized server route. The on-chain mint
    // still enforces `onlyRole`, but this gate prevents DB injection.
    const signedIn = await signIn();
    if (!signedIn) {
      setStatus("Error: SIWE sign-in failed.");
      setIsIssuing(false);
      return;
    }

    setStatus("Waiting for wallet confirmation...");

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

      // Optional real Pinata upload; fall back to a deterministic demo CID.
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
      } catch {
        // IPFS unavailable — keep the local deterministic CID.
      }

      const issuerSignature = await signIssuerAttestation(
        walletClient,
        address as Address,
        newCred,
        cid,
      );
      const txHash = await issueCredentialOnChain(
        walletClient,
        address as Address,
        newCred,
        studentAddress as Address,
        cid,
      );

      const tokenId = await getTokenIdByHash(
        credentialHashBytes32(newCred),
      );

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

      setStatus(`Success! Transaction: ${txHash.slice(0, 10)}...`);
      setStudentName("");
      setStudentAddress("");
      setCourse("");
      setTimeout(() => setStatus(""), 5000);
      await Promise.all([fetchIssued(), fetchActivity()]);
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message || "Issuance failed"}`);
    } finally {
      setIsIssuing(false);
    }
  }

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
        Issuer <span className="text-inkMuted">Console</span>
      </h1>

      {!isConnected ? (
        <div className="mt-8 border border-border bg-surface p-8">
          <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
            // STATUS: UNAUTHORIZED
          </p>
          <p className="mt-4 text-inkMuted max-w-md">
            Connect your institution's wallet to access the credential issuance
            terminal.
          </p>
        </div>
      ) : !isAuthorized ? (
        <div className="mt-8 border border-tampered bg-tamperedBg p-8">
          <p className="font-mono text-xs text-tampered uppercase tracking-widest">
            // NOT AUTHORIZED
          </p>
          <p className="mt-4 text-inkMuted max-w-md">
            This wallet does not hold the ISSUER_ROLE on the credential
            registry. Connect the registered institutional wallet.
          </p>
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          <div className="border-b border-border pb-4 flex justify-between items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted">
                ISSUER_ADDRESS
              </p>
              <p className="font-mono text-sm text-ink mt-1 truncate">
                {address}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted">
                ISSUED_ONCHAIN
              </p>
              <p className="font-mono text-sm text-ink mt-1">{issued.length}</p>
            </div>
          </div>

          <div className="border border-border bg-surface p-8 relative">
            <h2 className="text-xl font-medium tracking-tight uppercase mb-8">
              Execute Issuance
            </h2>

            <div className="mb-8 border border-dashed border-border bg-background p-6 text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-inkMuted mb-4">
                [Optional] Legacy Document Auto-Fill (AI OCR)
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleOcrUpload}
                disabled={isOcrScanning}
                className="block w-full text-sm text-inkMuted file:mr-4 file:py-2 file:px-4 file:border file:border-border file:bg-surface file:text-xs file:uppercase file:tracking-widest file:text-ink hover:file:border-ink/50 transition-colors"
              />
              {isOcrScanning && (
                <p className="mt-4 font-mono text-xs text-accent animate-pulse uppercase tracking-widest">
                  Analyzing Document via Tesseract AI...
                </p>
              )}
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <label
                  htmlFor="student-name"
                  className="mb-2 block font-mono text-xs uppercase tracking-widest text-inkMuted"
                >
                  Student Name
                </label>
                <input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aisha Verma"
                  className="w-full border border-border bg-background p-4 font-mono text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="student-address"
                  className="mb-2 block font-mono text-xs uppercase tracking-widest text-inkMuted"
                >
                  Student Wallet Address
                </label>
                <input
                  id="student-address"
                  value={studentAddress}
                  onChange={(e) => setStudentAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full border border-border bg-background p-4 font-mono text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="course"
                  className="mb-2 block font-mono text-xs uppercase tracking-widest text-inkMuted"
                >
                  Program Reference
                </label>
                <input
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full border border-border bg-background p-4 font-mono text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="doc-type"
                  className="mb-2 block font-mono text-xs uppercase tracking-widest text-inkMuted"
                >
                  Asset Class
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full border border-border bg-background p-4 font-mono text-sm text-ink focus:border-ink/50 focus:outline-none transition-colors appearance-none"
                >
                  <option value="degree">Degree Certificate</option>
                  <option value="transcript">Transcript</option>
                  <option value="migration">Migration Certificate</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={issue}
                  disabled={
                    isIssuing || !studentName || !studentAddress || !course
                  }
                  className="bg-accent text-background px-8 py-4 text-sm font-medium uppercase tracking-widest transition-transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 w-full"
                >
                  {isIssuing ? "Awaiting Confirmation..." : "Sign & Mint Asset"}
                </button>
              </div>

              {status && (
                <div
                  className={`mt-6 p-4 border ${
                    status.includes("Error")
                      ? "border-tampered bg-tamperedBg text-tampered"
                      : "border-valid bg-validBg text-valid"
                  }`}
                >
                  <p className="font-mono text-xs uppercase tracking-widest">
                    {status}
                  </p>
                </div>
              )}
            </div>
          </div>

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
                          const baseCred = {
                            id: row.credential.id,
                            issuerDid: row.credential.issuerDid,
                            issuerName: row.credential.issuerName,
                            studentName: row.credential.studentName,
                            studentAddress: row.credential.studentAddress,
                            rollNumber: row.credential.rollNumber,
                            course: row.credential.course,
                            docType: row.credential.docType,
                            issuedAt: row.credential.issuedAt,
                            claims: row.credential.claims,
                            issuedBy: row.credential.issuedBy
                          };
                          navigator.clipboard.writeText(JSON.stringify(baseCred, null, 2));
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
          </div>

          <div className="border border-border bg-surface p-8 relative mt-12">
            <h2 className="text-xl font-medium tracking-tight uppercase mb-8">
              Protocol Activity Log
            </h2>
            <div className="space-y-2">
              {activityLogs.length === 0 ? (
                <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
                  NO_ACTIVITY_DETECTED
                </p>
              ) : (
                activityLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p
                        className={`font-mono text-xs uppercase tracking-widest ${
                          log.type === "REVOKED"
                            ? "text-tampered"
                            : log.type === "ACCEPTED" || log.type === "PRESENTED"
                              ? "text-valid"
                              : "text-ink"
                        }`}
                      >
                        [{log.type}]
                      </p>
                      <p className="text-sm mt-1">{log.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] text-inkMuted uppercase tracking-widest">
                        Block: {log.blockNumber}
                      </p>
                      <p
                        className="font-mono text-[10px] text-inkMuted uppercase tracking-widest mt-1 truncate w-24 sm:w-auto"
                        title={log.tx}
                      >
                        Tx: {log.tx.slice(0, 10)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
