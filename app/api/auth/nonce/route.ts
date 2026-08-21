import { NextResponse } from "next/server";
import { createAuthNonce } from "@/lib/db";
import { generateNonce } from "siwe";

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: "Missing address" }, { status: 400 });
    }

    const nonce = generateNonce();
    await createAuthNonce(address, nonce);
    return NextResponse.json({ nonce });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create nonce" },
      { status: 500 },
    );
  }
}
