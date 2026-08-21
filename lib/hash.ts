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

export function credentialHash(credential: Credential): string {
  return keccak256(toHex(canonicalJson(credential)));
}
