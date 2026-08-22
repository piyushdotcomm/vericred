import { NextResponse } from "next/server";
import { scoreRisk } from "@/lib/ai-risk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const ORACLE_PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Helper function to call real AI models if keys are present
async function getAIRisk(credential: any, stats: any) {
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
      You are an AI Oracle for a Web3 Credential Registry.
      Analyze this credential and the issuer's on-chain stats.
      Provide a risk score from 0 (perfectly safe) to 100 (highly suspicious).
      Also provide 1-3 short reasons for your score.
      
      Credential: ${JSON.stringify(credential)}
      Issuer Stats: ${JSON.stringify(stats)}
      
      Return ONLY a raw JSON object with this exact structure:
      {
        "score": 35,
        "reasons": ["Issuer is not on the recognized registry."]
      }
      `;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await res.json();
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
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
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are an AI Oracle for a Web3 Credential Registry. Analyze the credential and the issuer's on-chain stats. Return a JSON object with 'score' (0-100) and 'reasons' (array of strings)."
            },
            {
              role: "user",
              content: `Credential: ${JSON.stringify(credential)}\nStats: ${JSON.stringify(stats)}`
            }
          ]
        })
      });
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("OpenAI failed, falling back to heuristics:", e);
    }
  }

  // Fallback to static rules
  return scoreRisk(credential, stats);
}

export async function POST(req: Request) {
  const { credential, stats } = await req.json();
  const risk = await getAIRisk(credential, stats);

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
