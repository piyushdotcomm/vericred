export type DocType = "transcript" | "migration" | "degree";

export type MigrationStatus = "none" | "issued" | "presented" | "accepted";

export interface Credential {
  id: string;
  issuerDid: string;
  issuerName: string;
  studentName: string;
  studentAddress: string;
  rollNumber: string;
  course: string;
  docType: DocType;
  issuedAt: string;
  claims: Record<string, string | number>;
  /** Static origin for a migration certificate (two-party document). */
  issuedBy?: string;
}

/**
 * The immutable credential is hashed and anchored on-chain.
 * Mutable lifecycle state (migration presentedTo / status) lives on-chain only,
 * so it is deliberately NOT part of this hashable type.
 */
export interface CredentialRecord {
  credential: Credential;
  cid: string;
  issuerSignature: string;
  docHash: string;
  tokenId: number;
}

export type VerificationStatus =
  | "VALID"
  | "TAMPERED"
  | "REVOKED"
  | "EXPIRED"
  | "DENIED";

export interface VerificationResult {
  status: VerificationStatus;
  hash: string;
  issuer: string;
  student: string;
  reason?: string;
}

export interface Grant {
  /** Wildcard address (0x0) means "bearer of the link". */
  verifier: string;
  credentialId: string;
  expiresAt: number;
  signature: string;
}

export interface RiskReport {
  score: number;
  reasons: string[];
}

export interface RegistryStats {
  issuerKnown: boolean;
  issuerCredentialCount: number;
  issuerAgeHours: number;
  issuerTemplateCount: number;
  duplicateHashCount: number;
  totalIssuances: number;
  /** Number of credentials the issuer minted in the most recent hour. */
  recentIssuanceCount: number;
}
