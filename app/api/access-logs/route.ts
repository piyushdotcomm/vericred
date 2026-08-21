import { NextResponse } from "next/server";
import { listAccessLogs, insertAccessLog } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const student = searchParams.get("student")?.toLowerCase();

    const logs = await listAccessLogs(student);
    return NextResponse.json(
      logs.map((l) => ({
        id: l.id,
        credentialId: l.credential_id,
        studentAddress: l.student_address,
        verifierAddress: l.verifier_address,
        docType: l.doc_type,
        timestamp: l.viewed_at,
      })),
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load access logs" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.credentialId || !body?.studentAddress) {
      return NextResponse.json(
        { error: "Missing credentialId or studentAddress" },
        { status: 400 },
      );
    }

    await insertAccessLog({
      studentAddress: body.studentAddress,
      credentialId: body.credentialId,
      verifierAddress: body.verifierAddress ?? null,
      docType: body.docType ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
