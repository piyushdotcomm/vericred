"use client";

import { useState } from "react";
import { credentialHash } from "@/lib/hash";
import { verifyCredential } from "@/lib/verify";
import { scoreRisk } from "@/lib/ai-risk";
import { CredentialCard } from "@/components/credential-card";
import { RiskBadge } from "@/components/risk-badge";
import type { Credential, VerificationResult, RiskReport } from "@/lib/types";

const demoCredential: Credential = {
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
};

export default function VerifyPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [risk, setRisk] = useState<RiskReport | null>(null);
  const [error, setError] = useState("");

  function runVerification(raw: string) {
    setError("");
    setResult(null);
    setCredential(null);
    setRisk(null);

    try {
      const parsed = JSON.parse(raw) as Credential;
      const hash = credentialHash(parsed);
      const state = {
        exists: true,
        revoked: false,
        issuer: parsed.issuerName,
        student: parsed.studentName,
        registeredHash: hash,
      };
      const verification = verifyCredential(parsed, state);
      setResult(verification);
      setCredential(parsed);
      setRisk(
        scoreRisk(parsed, {
          issuerCredentialCount: 5000,
          issuerAgeHours: 1,
          issuerTemplateCount: 5000,
          duplicateHashCount: 0,
          totalIssuances: 5000,
          issuerKnown: true,
        }),
      );
    } catch {
      setError("That is not valid credential JSON. Paste the full credential.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-8">
        <a href="/" className="text-sm text-ink/60 hover:text-ink">
          Back to home
        </a>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Verify a credential
        </h1>
        <p className="mt-2 text-ink/70">
          No wallet, no login. Paste the credential JSON or scan the QR from a
          shared link.
        </p>
      </header>

      <div className="space-y-6">
        <div className="rounded-soft border border-ink/10 bg-white p-6">
          <label
            htmlFor="credential-json"
            className="mb-2 block text-sm font-medium"
          >
            Credential JSON
          </label>
          <textarea
            id="credential-json"
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"id":"cred-1","issuerName":"University A",...}'
            className="w-full rounded-soft border border-ink/20 bg-surface p-3 font-mono text-xs leading-relaxed focus:border-accent focus:outline-none"
          />
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => runVerification(input)}
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-[1px] active:translate-y-0"
            >
              Verify
            </button>
            <button
              type="button"
              onClick={() => {
                const demo = JSON.stringify(demoCredential, null, 2);
                setInput(demo);
                runVerification(demo);
              }}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0"
            >
              Load sample
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-tampered">{error}</p>}
        </div>

        {result && credential && (
          <CredentialCard credential={credential} status={result.status} />
        )}

        {risk && <RiskBadge report={risk} />}
      </div>
    </main>
  );
}
