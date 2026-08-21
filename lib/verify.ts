import type {
  Credential,
  Grant,
  VerificationResult,
  VerificationStatus,
} from "./types";
import { credentialHash } from "./hash";

export interface OnChainState {
  exists: boolean;
  revoked: boolean;
  issuer: string;
  student: string;
  registeredHash: string;
}

export function verifyCredential(
  credential: Credential,
  state: OnChainState,
  grant?: Grant,
): VerificationResult {
  const hash = credentialHash(credential);

  if (grant) {
    if (Date.now() / 1000 > grant.expiresAt) {
      return {
        status: "EXPIRED" as VerificationStatus,
        hash,
        issuer: credential.issuerName,
        student: credential.studentName,
        reason: "Access grant has expired.",
      };
    }
  }

  if (!state.exists) {
    return {
      status: "TAMPERED" as VerificationStatus,
      hash,
      issuer: credential.issuerName,
      student: credential.studentName,
      reason: "No matching credential exists on chain.",
    };
  }

  if (state.revoked) {
    return {
      status: "REVOKED" as VerificationStatus,
      hash,
      issuer: credential.issuerName,
      student: credential.studentName,
      reason: "Credential was revoked by the issuer.",
    };
  }

  if (state.registeredHash !== hash) {
    return {
      status: "TAMPERED" as VerificationStatus,
      hash,
      issuer: credential.issuerName,
      student: credential.studentName,
      reason: "Document hash does not match the on-chain record.",
    };
  }

  return {
    status: "VALID" as VerificationStatus,
    hash,
    issuer: credential.issuerName,
    student: credential.studentName,
  };
}
