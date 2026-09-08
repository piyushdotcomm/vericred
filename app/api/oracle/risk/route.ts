import { NextResponse } from "next/server";
import { scoreRisk } from "@/lib/ai-risk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Helper function to call real AI models if keys are present
async function getAIRisk(
  credential: any,
  stats: any,
  verification?: any,
  issuerSigValid?: any,
) {
  // 1. If document failed cryptographic hash check, it is definitively tampered.
  if (verification && !verification.valid) {
    return {
      score: 100,
      reasons: [
        "CRITICAL: Cryptographic hash mismatch. Document content has been modified or does not match the ledger.",
      ],
    };
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
      You are an AI Risk Oracle for VeriCred, an institutional Web3 Credential Registry.
      Analyze this credential, cryptographic verification status, and issuer on-chain stats.

      CORE RULES:
      1. If the credential is cryptographically valid (verification.valid is true) and issuer statistics are normal, it is AUTHENTIC and SAFE. Return score: 0 and reasons: [].
      2. ONLY flag credentials that show genuine anomalies:
         - Tampered payload or hash mismatch (score: 100)
         - Revoked credential (score: 90)
         - Invalid or forged cryptographic signature (score: 85)
         - Extreme bot/sybil mass-minting anomalies (5000+ credentials in under 1 hour)
      3. NEVER falsely flag verified credentials with "Issuer is not on the recognized registry". If verification.valid is true, the issuer is authenticated by the ledger.

      Input Data:
      Credential: ${JSON.stringify(credential)}
      Verification: ${JSON.stringify(verification ?? { valid: true })}
      Issuer Signature Valid: ${issuerSigValid ?? "N/A"}
      Issuer Stats: ${JSON.stringify(stats)}

      Return ONLY a valid JSON object matching this schema:
      {
        "score": <number between 0 and 100>,
        "reasons": [<string array of specific anomalies detected, or empty array [] if clean and authentic>]
      }
      `;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: AbortSignal.timeout(4000),
        },
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (typeof parsed.score === "number" && Array.isArray(parsed.reasons)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("Gemini AI failed, falling back to heuristics:", e);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are an AI Risk Oracle for a Web3 Credential Registry. If the credential is cryptographically valid and stats are normal, return score: 0 and reasons: []. Only flag genuine anomalies like tampering, revocation, or mass-minting bot attacks. Return JSON with 'score' (0-100) and 'reasons' (array of strings).",
            },
            {
              role: "user",
              content: `Credential: ${JSON.stringify(credential)}\nVerification: ${JSON.stringify(verification ?? { valid: true })}\nIssuer Signature Valid: ${issuerSigValid ?? "N/A"}\nStats: ${JSON.stringify(stats)}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (typeof parsed.score === "number" && Array.isArray(parsed.reasons)) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.error("OpenAI failed, falling back to heuristics:", e);
    }
  }

  // Fallback to deterministic rules
  return scoreRisk(credential, stats, verification, issuerSigValid);
}

export async function POST(req: Request) {
  const { credential, stats, verification, issuerSigValid } = await req.json();
  const risk = await getAIRisk(credential, stats, verification, issuerSigValid);

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

  const signature = await account.signTypedData({
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
