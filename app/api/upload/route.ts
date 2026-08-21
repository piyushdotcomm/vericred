import { NextResponse } from "next/server";
import type { Credential } from "@/lib/types";
import { canonicalJson } from "@/lib/hash";

/**
 * Optional Pinata IPFS upload. Falls back to a deterministic local CID
 * when PINATA_JWT / PINATA_GATEWAY are not configured, so the demo works
 * with zero external dependency (exactly as the plan specifies).
 */
export async function POST(request: Request) {
  const credential: Credential = await request.json();

  const jwt = process.env.PINATA_JWT;
  const gateway = process.env.PINATA_GATEWAY;

  if (!jwt || !gateway) {
    const deterministic = `ipfs://local-${credential.id}`;
    return NextResponse.json({ cid: deterministic, source: "local-fallback" });
  }

  try {
    const blob = new Blob([canonicalJson(credential)], {
      type: "application/json",
    });
    const form = new FormData();
    form.append("file", blob, `${credential.id}.json`);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Pinata upload failed: ${res.status}`);
    }

    const data = await res.json();
    const cid = `ipfs://${data.IpfsHash}`;
    return NextResponse.json({ cid, source: "pinata" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "IPFS upload failed" },
      { status: 502 },
    );
  }
}
