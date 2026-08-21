import { keccak256, toHex } from "viem";
import type { Credential } from "./types";

export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return `[${obj.map(canonicalJson).join(",")}]`;
  }

  const sorted = Object.keys(obj as Record<string, unknown>)
    .sort()
    .map((key) => {
      return `${JSON.stringify(key)}:${canonicalJson(
        (obj as Record<string, unknown>)[key],
      )}`;
    });

  return `{${sorted.join(",")}}`;
}

/**
 * Ethereum addresses are case-insensitive. To keep the on-chain hash stable
 * regardless of how MetaMask or the API renders an address, normalize address
 * fields to lowercase before serializing.
 */
export function normalizeCredential(credential: Credential): Credential {
  return {
    ...credential,
    studentAddress: credential.studentAddress.toLowerCase(),
  };
}

export function credentialHash(credential: Credential): string {
  return keccak256(toHex(canonicalJson(normalizeCredential(credential))));
}

/** Same hash, but expressed as a viem `bytes32`-typed value for contract calls. */
export function credentialHashBytes32(credential: Credential): `0x${string}` {
  return credentialHash(credential) as `0x${string}`;
}
