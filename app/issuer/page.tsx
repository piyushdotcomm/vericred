"use client";

import { useState } from "react";
import { useWallet } from "@/lib/use-wallet";
import { WalletConnect } from "@/components/wallet-connect";

export default function IssuerPage() {
  const { isConnected, address } = useWallet();
  const [issued, setIssued] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");
  const [docType, setDocType] = useState("degree");

  function issue() {
    if (!studentName || !course) return;
    setIssued((n) => n + 1);
    setStudentName("");
    setCourse("");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="flex items-center justify-between">
        <a href="/" className="text-sm text-ink/60 hover:text-ink">
          Back to home
        </a>
        <WalletConnect />
      </header>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Issuer portal
      </h1>

      {!isConnected ? (
        <p className="mt-4 text-ink/70">Connect the university wallet.</p>
      ) : (
        <div className="mt-6 space-y-6">
          <p className="font-mono text-xs text-ink/50">{address}</p>

          <div className="rounded-soft border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-semibold">Issue credential</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="student-name" className="mb-2 block text-sm font-medium">
                  Student name
                </label>
                <input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full rounded-soft border border-ink/20 bg-surface p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="course" className="mb-2 block text-sm font-medium">
                  Course
                </label>
                <input
                  id="course"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-soft border border-ink/20 bg-surface p-3 text-sm focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="doc-type" className="mb-2 block text-sm font-medium">
                  Document type
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-soft border border-ink/20 bg-surface p-3 text-sm focus:border-accent focus:outline-none"
                >
                  <option value="degree">Degree Certificate</option>
                  <option value="transcript">Transcript</option>
                  <option value="migration">Migration Certificate</option>
                </select>
              </div>
              <button
                type="button"
                onClick={issue}
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-[1px] active:translate-y-0"
              >
                Issue credential
              </button>
            </div>
          </div>

          <p className="text-sm text-ink/60">
            Issued in this session: {issued}
          </p>
        </div>
      )}
    </main>
  );
}
