import { NextResponse } from "next/server";
import { listCredentials, upsertCredential } from "@/lib/db";
import { getIssuerSession } from "@/lib/session";
import type { CredentialRecord } from "@/lib/types";

export async function GET() {
  try {
    const rows = await listCredentials();
    // Return a flat credential + metadata object for the pages.
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        issuerDid: r.issuer_did,
        issuerName: r.issuer_name ?? "University",
        studentName: r.student_name,
        studentAddress: r.student_address,
        rollNumber: r.roll_number ?? "",
        course: r.course ?? "",
        docType: r.doc_type,
        issuedAt: new Date(r.issued_at).toISOString(),
        claims: r.claims,
        issuedBy: r.issued_by ?? undefined,
        cid: r.cid ?? "",
        issuerSignature: r.issuer_signature ?? "",
        docHash: r.doc_hash,
        tokenId: r.token_id ?? 0,
      })),
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load credentials" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const record: CredentialRecord = await request.json();

    if (!record?.credential?.id || !record?.credential?.studentAddress) {
      return NextResponse.json(
        { error: "Invalid credential payload" },
        { status: 400 },
      );
    }

    // Only the SIWE-authenticated issuer may persist the metadata cache for a
    // credential they just minted on-chain. The on-chain `onlyRole` check is
    // the real gate; this prevents arbitrary DB injection.
    const session = getIssuerSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: sign in with Ethereum first" },
        { status: 401 },
      );
    }

    const expectedIssuerDid = `did:web:issuer-${session}`;
    if (record.credential.issuerDid !== expectedIssuerDid) {
      return NextResponse.json(
        { error: "Forbidden: issuer session mismatch" },
        { status: 403 },
      );
    }

    await upsertCredential(record);
    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
