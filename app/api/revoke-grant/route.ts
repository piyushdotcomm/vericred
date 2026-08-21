import { NextResponse } from "next/server";
import { isGrantRevoked, revokeGrant } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get("signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    return NextResponse.json({ isRevoked: await isGrantRevoked(signature) });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to check revocation" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { signature } = await request.json();
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    await revokeGrant(signature);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to revoke grant" },
      { status: 500 },
    );
  }
}
