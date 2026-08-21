import { NextResponse } from "next/server";
import { SiweMessage } from "siwe";
import { consumeAuthNonce, getAuthNonce } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { message, signature } = await request.json();
    if (!message || !signature) {
      return NextResponse.json(
        { error: "Missing message or signature" },
        { status: 400 },
      );
    }

    const siwe = new SiweMessage(message);
    const expectedNonce = await getAuthNonce(siwe.address);
    if (!expectedNonce || siwe.nonce !== expectedNonce) {
      return NextResponse.json(
        { error: "Invalid or expired nonce" },
        { status: 401 },
      );
    }

    const { data, success, error } = await siwe.verify({ signature });
    if (!success || !data) {
      return NextResponse.json(
        { error: error?.type || "Invalid signature" },
        { status: 401 },
      );
    }

    await consumeAuthNonce(data.address);

    const response = NextResponse.json({
      success: true,
      address: data.address,
    });

    // HttpOnly, SameSite=Lax, 7-day issuer session cookie.
    response.cookies.set("vericred_issuer", data.address.toLowerCase(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify SIWE" },
      { status: 500 },
    );
  }
}
