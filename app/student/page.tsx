"use client";

import { useState } from "react";
import { useWallet } from "@/lib/use-wallet";
import { WalletConnect } from "@/components/wallet-connect";
import { CredentialCard } from "@/components/credential-card";
import type { Credential } from "@/lib/types";

const seededCredentials: Credential[] = [
  {
    id: "cred-demo-1",
    issuerDid: "did:web:university-a.edu",
    issuerName: "University A",
    studentName: "Aisha Verma",
    studentAddress: "0xabc",
    rollNumber: "2021CS045",
    course: "B.Tech Computer Science",
    docType: "degree",
    issuedAt: "2025-06-15T10:00:00Z",
    claims: { cgpa: 8.4, program: "B.Tech" },
  },
  {
    id: "cred-demo-2",
    issuerDid: "did:web:university-a.edu",
    issuerName: "University A",
    studentName: "Aisha Verma",
    studentAddress: "0xabc",
    rollNumber: "2021CS045",
    course: "B.Tech Computer Science",
    docType: "transcript",
    issuedAt: "2025-06-15T10:00:00Z",
    claims: { cgpa: 8.4, program: "B.Tech" },
  },
];

export default function StudentPage() {
  const { isConnected, address } = useWallet();
  const [shared, setShared] = useState<Record<string, string>>({});

  function share(credential: Credential) {
    const payload = btoa(JSON.stringify(credential));
    const url = `${window.location.origin}/verify?c=${payload}`;
    setShared((prev) => ({ ...prev, [credential.id]: url }));
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
        Your vault
      </h1>

      {!isConnected ? (
        <p className="mt-4 text-ink/70">
          Connect your wallet to see credentials issued to you.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="font-mono text-xs text-ink/50">{address}</p>
          {seededCredentials.map((credential) => (
            <div key={credential.id}>
              <CredentialCard credential={credential} status="VALID" />
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => share(credential)}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0"
                >
                  Share
                </button>
                {shared[credential.id] && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(shared[credential.id])}
                    className="rounded-full border border-accent/40 px-4 py-2 text-sm font-medium text-accent transition-transform hover:-translate-y-[1px] active:translate-y-0"
                  >
                    Copy link
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
