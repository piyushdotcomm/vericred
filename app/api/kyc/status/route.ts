import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vericred-super-secret-key-123",
);

export async function GET() {
  const token = cookies().get("vericred_kyc")?.value;
  if (!token) return NextResponse.json({ verified: false });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({
      verified: true,
      address: payload.sub,
      email: payload.email,
    });
  } catch {
    return NextResponse.json({ verified: false });
  }
}
