import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

/**
 * Seed the Supabase `credentials` table from data/credentials.json.
 * Run after `npm run seed` (contract-level seeding) with SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY set in .env.local.
 */
async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running db:seed.",
    );
    process.exit(1);
  }

  const file = path.join(process.cwd(), "data", "credentials.json");
  const records = JSON.parse(fs.readFileSync(file, "utf-8"));

  const db = createClient(url, key);
  const rows = records.map(
    (r: {
      credential: any;
      cid: string;
      issuerSignature: string;
      docHash: string;
      tokenId: number;
    }) => ({
      id: r.credential.id,
      doc_hash: r.docHash,
      token_id: r.tokenId,
      cid: r.cid,
      issuer_signature: r.issuerSignature,
      issuer_did: r.credential.issuerDid,
      issuer_name: r.credential.issuerName,
      student_name: r.credential.studentName,
      student_address: r.credential.studentAddress.toLowerCase(),
      roll_number: r.credential.rollNumber,
      course: r.credential.course,
      doc_type: r.credential.docType,
      issued_at: r.credential.issuedAt,
      claims: r.credential.claims,
      issued_by: r.credential.issuedBy ?? null,
    }),
  );

  const { error } = await db.from("credentials").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    console.error("DB seed failed:", error);
    process.exit(1);
  }

  console.log(`Seeded ${rows.length} credentials into Supabase.`);
}

main();
