import type { Credential, RiskReport } from "./types";

export interface RegistryStats {
  issuerCredentialCount: number;
  issuerAgeHours: number;
  issuerTemplateCount: number;
  duplicateHashCount: number;
  totalIssuances: number;
  issuerKnown: boolean;
}

export function scoreRisk(
  credential: Credential,
  stats: RegistryStats,
): RiskReport {
  const reasons: string[] = [];
  let score = 0;

  if (!stats.issuerKnown) {
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
