import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { createStudentIdentity } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vericred-super-secret-key-123",
);

export async function POST(req: Request) {
  const { address, email, otp } = await req.json();

  if (!address || !email || !otp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Simulated OTP verification
  if (otp !== "123456") {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Create Identity in Database
  await createStudentIdentity(address, email);

  // Issue JWT
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(address.toLowerCase())
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  cookies().set("vericred_kyc", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
