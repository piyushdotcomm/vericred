import {
  createPublicClient,
  http,
  type Address,
  type Chain,
  type Hash,
  type Hex,
  type PublicClient,
  type WalletClient,
  keccak256,
  toHex,
  verifyTypedData,
} from "viem";
import { hardhat, polygonAmoy } from "viem/chains";
import { CREDENTIAL_SBT_ABI } from "./contract-abi";
import type { Credential, RegistryStats } from "./types";
import { canonicalJson, normalizeCredential } from "./hash";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

export function getChain(): Chain {
  return process.env.NEXT_PUBLIC_CHAIN_ID === "80002" ||
    RPC_URL.includes("amoy") ||
    RPC_URL.includes("polygon")
    ? polygonAmoy
    : hardhat;
}

let CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

try {
  // Static JSON import keeps this bundler-safe (no fs in the browser).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const deployment = require("./deployment.json") as { address?: string };
  if (deployment.address) {
    CONTRACT_ADDRESS = deployment.address as Address;
  }
} catch {
  // deployment.json not present — use default/env.
}

// ---------------------------------------------------------------------------
// EIP-712 domains (chainId is dynamic so signatures work on Hardhat + Amoy)
// ---------------------------------------------------------------------------
function grantDomain() {
  return {
    name: "VeriCred",
    version: "1",
    chainId: getChain().id,
  } as const;
}

const GRANT_TYPES = {
  Grant: [
    { name: "verifier", type: "address" },
    { name: "credentialId", type: "string" },
    { name: "expiresAt", type: "uint256" },
  ],
} as const;

function issuerDomain() {
  return {
    name: "VeriCred Issuer",
    version: "1",
    chainId: getChain().id,
  } as const;
}

const ISSUER_TYPES = {
  Attestation: [
    { name: "docHash", type: "bytes32" },
    { name: "cid", type: "string" },
    { name: "student", type: "address" },
  ],
} as const;

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

/** Read-only client — works without a wallet. Anyone can verify. */
export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: getChain(),
    transport: http(RPC_URL),
  });
}

// ---------------------------------------------------------------------------
// READ — wallet-free verification (the critical path)
// ---------------------------------------------------------------------------

export interface OnChainVerifyResult {
  valid: boolean;
  issuer: Address;
  student: Address;
  revoked: boolean;
  docType: string;
}

export async function verifyOnChain(
  credential: Credential,
): Promise<OnChainVerifyResult> {
  const client = getPublicClient();
  const canonical = canonicalJson(normalizeCredential(credential));
  const docHash = keccak256(toHex(canonical));

  const result = (await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "verifyCredential",
    args: [docHash as `0x${string}`],
  })) as [boolean, Address, Address, boolean, string];

  return {
    valid: result[0],
    issuer: result[1],
    student: result[2],
    revoked: result[3],
    docType: result[4],
  };
}

export interface OnChainCredential {
  issuer: Address;
  student: Address;
  docHash: Hex;
  docType: string;
  cid: string;
  issuedAt: bigint;
  revoked: boolean;
  migrationStatus: number;
  presentedTo: Address;
}

export async function getCredentialOnChain(
  tokenId: bigint | number,
): Promise<OnChainCredential> {
  const client = getPublicClient();
  const c = (await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "getCredential",
    args: [BigInt(tokenId)],
  })) as unknown as OnChainCredential;
  return c;
}

export async function getTokenIdByHash(
  docHash: Hash,
): Promise<bigint | null> {
  const client = getPublicClient();
  const logs = await client.getLogs({
    address: CONTRACT_ADDRESS,
    event: {
      type: "event",
      name: "CredentialIssued",
      inputs: [
        { type: "uint256", name: "tokenId", indexed: true },
        { type: "address", name: "issuer", indexed: true },
        { type: "address", name: "student", indexed: true },
        { type: "bytes32", name: "docHash", indexed: false },
        { type: "string", name: "docType", indexed: false },
      ],
    },
    fromBlock: "earliest",
  });

  const match = logs.find(
    (log: { args: { docHash?: Hex; tokenId?: bigint } }) =>
      log.args.docHash === docHash,
  );
  return match?.args?.tokenId ?? null;
}

export async function checkIsIssuer(account: Address): Promise<boolean> {
  const client = getPublicClient();
  return (await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "isIssuer",
    args: [account],
  })) as boolean;
}

export async function tokensOfOwner(owner: Address): Promise<bigint[]> {
  const client = getPublicClient();
  return (await client.readContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "tokensOfOwner",
    args: [owner],
  })) as bigint[];
}

export async function fetchRegistryStats(
  issuer: Address,
): Promise<RegistryStats> {
  const client = getPublicClient();
  const [known, count, firstIssued, templateCount, lastIssued, total] =
    (await client.multicall({
      contracts: [
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "isIssuer",
          args: [issuer],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "issuerCredentialCount",
          args: [issuer],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "issuerFirstIssuedAt",
          args: [issuer],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "issuerTemplateCount",
          args: [issuer],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "issuerLastIssuedAt",
          args: [issuer],
        },
        {
          address: CONTRACT_ADDRESS,
          abi: CREDENTIAL_SBT_ABI,
          functionName: "totalIssuances",
          args: [],
        },
      ],
    })) as { result: unknown; status: string }[];

  const issuerCredentialCount = Number(count.result ?? 0);
  const first = Number(firstIssued.result ?? 0);
  const last = Number(lastIssued.result ?? 0);
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = first > 0 ? now - first : 0;
  const lastAgeSeconds = last > 0 ? now - last : 0;

  return {
    issuerKnown: Boolean(known.result),
    issuerCredentialCount,
    issuerAgeHours: ageSeconds / 3600,
    issuerTemplateCount: Number(templateCount.result ?? 0),
    duplicateHashCount: 0,
    totalIssuances: Number(total.result ?? 0),
    recentIssuanceCount: lastAgeSeconds <= 3600 ? issuerCredentialCount : 0,
  };
}

// ---------------------------------------------------------------------------
// WRITE — the caller supplies wagmi's walletClient + account
// ---------------------------------------------------------------------------

export async function issueCredentialOnChain(
  walletClient: WalletClient,
  account: Address,
  credential: Credential,
  studentAddress: Address,
  cid: string,
): Promise<Hash> {
  const docHash = keccak256(
    toHex(canonicalJson(normalizeCredential(credential))),
  );

  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "issueCredential",
    args: [studentAddress, docHash as `0x${string}`, credential.docType, cid],
    account,
    chain: getChain(),
  });
}

export async function revokeCredentialOnChain(
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint | number,
): Promise<Hash> {
  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "revokeCredential",
    args: [BigInt(tokenId)],
    account,
    chain: getChain(),
  });
}

export async function presentMigrationOnChain(
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint | number,
  destination: Address,
): Promise<Hash> {
  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "presentMigration",
    args: [BigInt(tokenId), destination],
    account,
    chain: getChain(),
  });
}

export async function acceptMigrationOnChain(
  walletClient: WalletClient,
  account: Address,
  tokenId: bigint | number,
  destination: Address,
): Promise<Hash> {
  return walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: CREDENTIAL_SBT_ABI,
    functionName: "acceptMigration",
    args: [BigInt(tokenId), destination],
    account,
    chain: getChain(),
  });
}

// ---------------------------------------------------------------------------
// EIP-712 PERMISSIONED GRANTS (revocable + expiring + verifier-bound)
// ---------------------------------------------------------------------------

export interface GrantPayload {
  verifier: Address;
  credentialId: string;
  expiresAt: number;
  signature: Hex;
}

export async function signGrant(
  walletClient: WalletClient,
  account: Address,
  verifier: Address,
  credentialId: string,
  expiresAt: number,
): Promise<Hex> {
  return walletClient.signTypedData({
    account,
    domain: grantDomain(),
    types: GRANT_TYPES,
    primaryType: "Grant",
    message: {
      verifier,
      credentialId,
      expiresAt: BigInt(expiresAt),
    },
  });
}

export async function verifyGrantSignature(
  grant: GrantPayload,
  expectedSigner: Address,
): Promise<boolean> {
  try {
    return await verifyTypedData({
      domain: grantDomain(),
      types: GRANT_TYPES,
      primaryType: "Grant",
      message: {
        verifier: grant.verifier,
        credentialId: grant.credentialId,
        expiresAt: BigInt(grant.expiresAt),
      },
      signature: grant.signature,
      address: expectedSigner,
    });
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// EIP-712 ISSUER ATTESTATION (proof-of-real: issuer signature over the hash)
// ---------------------------------------------------------------------------

export async function signIssuerAttestation(
  walletClient: WalletClient,
  account: Address,
  credential: Credential,
  cid: string,
): Promise<Hex> {
  const docHash = keccak256(
    toHex(canonicalJson(normalizeCredential(credential))),
  );

  return walletClient.signTypedData({
    account,
    domain: issuerDomain(),
    types: ISSUER_TYPES,
    primaryType: "Attestation",
    message: {
      docHash,
      cid,
      student: credential.studentAddress as Address,
    },
  });
}

export async function verifyIssuerAttestation(
  credential: Credential,
  cid: string,
  signature: Hex,
  expectedIssuer: Address,
): Promise<boolean> {
  const docHash = keccak256(
    toHex(canonicalJson(normalizeCredential(credential))),
  );
  try {
    return await verifyTypedData({
      domain: issuerDomain(),
      types: ISSUER_TYPES,
      primaryType: "Attestation",
      message: {
        docHash,
        cid,
        student: credential.studentAddress as Address,
      },
      signature,
      address: expectedIssuer,
    });
  } catch {
    return false;
  }
}

export { CONTRACT_ADDRESS };
