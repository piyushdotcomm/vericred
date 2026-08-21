import { describe, it, expect } from "vitest";
import { canonicalJson, credentialHash } from "../lib/hash";
import { verifyCredential } from "../lib/verify";
import { scoreRisk } from "../lib/ai-risk";
import type { Credential } from "../lib/types";

const baseCredential: Credential = {
  id: "cred-1",
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

describe("canonicalJson", () => {
  it("produces the same string regardless of key order", () => {
    const a = canonicalJson({ b: 1, a: 2, c: 3 });
    const b = canonicalJson({ c: 3, a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it("handles nested objects deterministically", () => {
    const a = canonicalJson({ x: { b: 1, a: 2 } });
    const b = canonicalJson({ x: { a: 2, b: 1 } });
    expect(a).toBe(b);
  });
});

describe("credentialHash", () => {
  it("changes when one character changes", () => {
    const h1 = credentialHash(baseCredential);
    const h2 = credentialHash({ ...baseCredential, studentName: "Aisha Varma" });
    expect(h1).not.toBe(h2);
  });
});

describe("verifyCredential", () => {
  it("returns VALID when hash matches and not revoked", () => {
    const hash = credentialHash(baseCredential);
    const result = verifyCredential(baseCredential, {
      exists: true,
      revoked: false,
      issuer: baseCredential.issuerName,
      student: baseCredential.studentName,
      registeredHash: hash,
    });
    expect(result.status).toBe("VALID");
  });

  it("returns TAMPERED when hash mismatches", () => {
    const result = verifyCredential(baseCredential, {
      exists: true,
      revoked: false,
      issuer: baseCredential.issuerName,
      student: baseCredential.studentName,
      registeredHash: "0xdeadbeef",
    });
    expect(result.status).toBe("TAMPERED");
  });

  it("returns REVOKED when the credential is revoked", () => {
    const hash = credentialHash(baseCredential);
    const result = verifyCredential(baseCredential, {
      exists: true,
      revoked: true,
      issuer: baseCredential.issuerName,
      student: baseCredential.studentName,
      registeredHash: hash,
    });
    expect(result.status).toBe("REVOKED");
  });

  it("returns EXPIRED when grant is expired", () => {
    const hash = credentialHash(baseCredential);
    const result = verifyCredential(
      baseCredential,
      {
        exists: true,
        revoked: false,
        issuer: baseCredential.issuerName,
        student: baseCredential.studentName,
        registeredHash: hash,
      },
      {
        verifier: "0xemp",
        credentialId: "cred-1",
        expiresAt: Math.floor(Date.now() / 1000) - 100,
        signature: "0xsig",
      },
    );
    expect(result.status).toBe("EXPIRED");
  });
});

describe("scoreRisk", () => {
  it("returns low score for a normal issuer", () => {
    const report = scoreRisk(baseCredential, {
      issuerCredentialCount: 10,
      issuerAgeHours: 5000,
      issuerTemplateCount: 2,
      duplicateHashCount: 0,
      totalIssuances: 10,
      issuerKnown: true,
    });
    expect(report.score).toBeLessThan(20);
    expect(report.reasons).toHaveLength(0);
  });

  it("returns >= 90 for mass issuance + identical template", () => {
    const report = scoreRisk(baseCredential, {
      issuerCredentialCount: 5000,
      issuerAgeHours: 1,
      issuerTemplateCount: 5000,
      duplicateHashCount: 0,
      totalIssuances: 5000,
      issuerKnown: true,
    });
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.reasons.length).toBeGreaterThan(0);
  });

  it("flags unknown issuer", () => {
    const report = scoreRisk(baseCredential, {
      issuerCredentialCount: 1,
      issuerAgeHours: 10,
      issuerTemplateCount: 1,
      duplicateHashCount: 0,
      totalIssuances: 1,
      issuerKnown: false,
    });
    expect(report.reasons.some((r) => r.includes("not on the recognized"))).toBe(
      true,
    );
  });
});
