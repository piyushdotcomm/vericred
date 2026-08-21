export type DocType = "transcript" | "migration" | "degree";

export type MigrationStatus = "issued" | "presented" | "accepted";

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
}

export interface MigrationCredential extends Credential {
  docType: "migration";
  issuedBy: string;
  presentedTo?: string;
  status: MigrationStatus;
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
  verifier: string;
  credentialId: string;
  expiresAt: number;
  signature: string;
}

export interface RiskReport {
  score: number;
  reasons: string[];
}
