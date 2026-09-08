import type { Credential, RegistryStats, RiskReport } from "./types";

export interface VerificationContext {
  valid: boolean;
  revoked?: boolean;
  issuer?: string;
  student?: string;
  docType?: string;
  issuerName?: string;
}

export function scoreRisk(
  credential: Credential,
  stats: RegistryStats,
  verification?: VerificationContext,
  issuerSigValid?: boolean | null,
): RiskReport {
  const reasons: string[] = [];

  // 1. Critical Tamper Detection: Cryptographic hash mismatch
  if (verification !== undefined && !verification.valid) {
    return {
      score: 100,
      reasons: [
        "CRITICAL: Cryptographic hash mismatch. Document content has been modified or does not match the ledger.",
      ],
    };
  }

  let score = 0;

  // 2. Signature Validation: Forged or invalid EIP-712 signature
  if (issuerSigValid === false) {
    score += 85;
    reasons.push(
      "CRITICAL: Issuer cryptographic attestation signature is invalid or forged.",
    );
  }

  // 3. Revocation Status: Credential explicitly revoked on-chain
  if (verification?.revoked) {
    score += 90;
    reasons.push(
      "REVOKED: This credential was explicitly revoked by the issuing authority.",
    );
  }

  // 4. Registry Status:
  // If verification is valid, the issuer is verified on-chain.
  // Only penalize unknown issuer if the document is NOT verified.
  if (!stats.issuerKnown && !verification?.valid) {
    score += 35;
    reasons.push("Issuer is not on the recognized registry.");
  }

  const isMassIssuance =
    stats.issuerCredentialCount >= 5000 && stats.issuerAgeHours <= 1;
  const isTemplateEntropy =
    stats.issuerTemplateCount >= 500 && stats.issuerCredentialCount >= 5000;

  if (isMassIssuance) {
    score += 52;
    reasons.push(
      `Issuer minted ${stats.issuerCredentialCount} credentials in under 1 hour.`,
    );
  }

  if (isTemplateEntropy) {
    score += 40;
    reasons.push(
      "High volume of credentials share an identical metadata template.",
    );
  }

  const isSyntheticIssuer =
    stats.issuerCredentialCount >= 100 &&
    stats.issuerCredentialCount < 5000 &&
    stats.issuerAgeHours <= 1;

  if (isSyntheticIssuer) {
    score += 15;
    reasons.push("Issuer appears synthetic (new, then a sudden burst).");
  }

  if (stats.recentIssuanceCount >= 100) {
    score += 10;
    reasons.push(
      `Issuer minted ${stats.recentIssuanceCount} credentials in the last hour.`,
    );
  }

  if (stats.duplicateHashCount > 1) {
    score += 20;
    reasons.push(
      `Credential hash appears ${stats.duplicateHashCount} times with different names.`,
    );
  }

  return {
    score: Math.min(100, score),
    reasons,
  };
}
