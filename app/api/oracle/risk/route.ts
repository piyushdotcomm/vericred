import { NextResponse } from "next/server";
import { scoreRisk } from "@/lib/ai-risk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export async function POST(req: Request) {
  const { credential, stats } = await req.json();
  const risk = scoreRisk(credential, stats);

  const account = privateKeyToAccount(ORACLE_PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({ account, chain: hardhat, transport: http() });

  const domain = {
    name: "VeriCred Oracle",
    version: "1",
    chainId: 31337,
    verifyingContract: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  };

  const types = {
    RiskReport: [
      { name: "credentialId", type: "string" },
      { name: "score", type: "uint8" },
    ],
  };

  const signature = await client.signTypedData({
    domain,
    types,
    primaryType: "RiskReport",
    message: {
      credentialId: credential.id,
      score: risk.score,
    },
  });

  return NextResponse.json({
    risk,
    signature,
    oracleAddress: account.address,
  });
}
