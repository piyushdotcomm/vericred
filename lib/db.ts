import fs from "fs";
import path from "path";
import { getSupabaseAdmin } from "./supabase";
import type { CredentialRecord } from "./types";

export interface AccessLogRow {
  id: string;
  student_address: string;
  credential_id: string;
  verifier_address: string | null;
  doc_type: string | null;
  viewed_at: string;
}

export interface CredentialRow {
  id: string;
  doc_hash: string;
  token_id: number | null;
  cid: string | null;
  issuer_signature: string | null;
  issuer_did: string;
  issuer_name: string | null;
  student_name: string;
  student_address: string;
  roll_number: string | null;
  course: string | null;
  doc_type: string;
  issued_at: string;
  claims: Record<string, string | number>;
  issued_by: string | null;
}

// ---------------------------------------------------------------------------
// Local JSON persistence (zero-setup fallback for running the project locally)
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const CREDENTIALS_FILE = path.join(DATA_DIR, "credentials.json");
const ACCESS_LOGS_FILE = path.join(DATA_DIR, "access-logs.json");
const REVOKED_GRANTS_FILE = path.join(DATA_DIR, "revoked-grants.json");
const AUTH_NONCES_FILE = path.join(DATA_DIR, "auth-nonces.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, fallback: T): T {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf-8");
}

function hasSupabase(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

export async function listCredentials(): Promise<CredentialRow[]> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("credentials")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CredentialRow[];
  }

  const records = readJson<CredentialRecord[]>(CREDENTIALS_FILE, []);
  return records.map((r) => ({
    id: r.credential.id,
    doc_hash: r.docHash,
    token_id: r.tokenId,
    cid: r.cid,
    issuer_signature: r.issuerSignature,
    issuer_did: r.credential.issuerDid,
    issuer_name: r.credential.issuerName,
    student_name: r.credential.studentName,
    student_address: r.credential.studentAddress,
    roll_number: r.credential.rollNumber,
    course: r.credential.course,
    doc_type: r.credential.docType,
    issued_at: r.credential.issuedAt,
    claims: r.credential.claims,
    issued_by: r.credential.issuedBy ?? null,
  }));
}

export async function upsertCredential(record: CredentialRecord): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { credential, cid, issuerSignature, docHash, tokenId } = record;
    const { error } = await db.from("credentials").upsert(
      {
        id: credential.id,
        doc_hash: docHash,
        token_id: tokenId,
        cid,
        issuer_signature: issuerSignature,
        issuer_did: credential.issuerDid,
        issuer_name: credential.issuerName,
        student_name: credential.studentName,
        student_address: credential.studentAddress.toLowerCase(),
        roll_number: credential.rollNumber,
        course: credential.course,
        doc_type: credential.docType,
        issued_at: credential.issuedAt,
        claims: credential.claims,
        issued_by: credential.issuedBy ?? null,
      },
      { onConflict: "id" },
    );
    if (error) throw error;
    return;
  }

  const records = readJson<CredentialRecord[]>(CREDENTIALS_FILE, []);
  const index = records.findIndex((r) => r.credential.id === record.credential.id);
  if (index >= 0) records[index] = record;
  else records.push(record);
  writeJson(CREDENTIALS_FILE, records);
}

// ---------------------------------------------------------------------------
// Access logs
// ---------------------------------------------------------------------------

export async function listAccessLogs(
  studentAddress?: string,
): Promise<AccessLogRow[]> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    let query = db.from("access_logs").select("*");
    if (studentAddress) {
      query = query.eq("student_address", studentAddress.toLowerCase());
    }
    const { data, error } = await query.order("viewed_at", {
      ascending: false,
    });
    if (error) throw error;
    return (data ?? []) as AccessLogRow[];
  }

  const logs = readJson<AccessLogRow[]>(ACCESS_LOGS_FILE, []);
  return studentAddress
    ? logs.filter((l) => l.student_address === studentAddress.toLowerCase())
    : logs;
}

export async function insertAccessLog(log: {
  studentAddress: string;
  credentialId: string;
  verifierAddress: string | null;
  docType: string | null;
}): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { error } = await db.from("access_logs").insert({
      student_address: log.studentAddress.toLowerCase(),
      credential_id: log.credentialId,
      verifier_address: log.verifierAddress,
      doc_type: log.docType,
    });
    if (error) throw error;
    return;
  }

  const logs = readJson<AccessLogRow[]>(ACCESS_LOGS_FILE, []);
  logs.push({
    id: `log-${Date.now()}`,
    student_address: log.studentAddress.toLowerCase(),
    credential_id: log.credentialId,
    verifier_address: log.verifierAddress,
    doc_type: log.docType,
    viewed_at: new Date().toISOString(),
  });
  writeJson(ACCESS_LOGS_FILE, logs);
}

// ---------------------------------------------------------------------------
// Revoked grants
// ---------------------------------------------------------------------------

export async function isGrantRevoked(signature: string): Promise<boolean> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("revoked_grants")
      .select("signature")
      .eq("signature", signature)
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  }

  const revoked = readJson<string[]>(REVOKED_GRANTS_FILE, []);
  return revoked.includes(signature);
}

export async function revokeGrant(signature: string): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("revoked_grants")
      .upsert({ signature }, { onConflict: "signature" });
    if (error) throw error;
    return;
  }

  const revoked = readJson<string[]>(REVOKED_GRANTS_FILE, []);
  if (!revoked.includes(signature)) {
    revoked.push(signature);
    writeJson(REVOKED_GRANTS_FILE, revoked);
  }
}

// ---------------------------------------------------------------------------
// SIWE nonces
// ---------------------------------------------------------------------------

interface AuthNonceRow {
  address: string;
  nonce: string;
  issued_at: string;
  consumed_at: string | null;
}

export async function createAuthNonce(
  address: string,
  nonce: string,
): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { error } = await db.from("auth_nonces").upsert({
      address: address.toLowerCase(),
      nonce,
      issued_at: new Date().toISOString(),
      consumed_at: null,
    });
    if (error) throw error;
    return;
  }

  const nonces = readJson<AuthNonceRow[]>(AUTH_NONCES_FILE, []);
  const index = nonces.findIndex((n) => n.address === address.toLowerCase());
  const row = {
    address: address.toLowerCase(),
    nonce,
    issued_at: new Date().toISOString(),
    consumed_at: null,
  };
  if (index >= 0) nonces[index] = row;
  else nonces.push(row);
  writeJson(AUTH_NONCES_FILE, nonces);
}

export async function getAuthNonce(address: string): Promise<string | null> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("auth_nonces")
      .select("nonce")
      .eq("address", address.toLowerCase())
      .is("consumed_at", null)
      .maybeSingle();
    if (error) throw error;
    return data?.nonce ?? null;
  }

  const nonces = readJson<AuthNonceRow[]>(AUTH_NONCES_FILE, []);
  return (
    nonces.find(
      (n) => n.address === address.toLowerCase() && !n.consumed_at,
    )?.nonce ?? null
  );
}

export async function consumeAuthNonce(address: string): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { error } = await db
      .from("auth_nonces")
      .update({ consumed_at: new Date().toISOString() })
      .eq("address", address.toLowerCase());
    if (error) throw error;
    return;
  }

  const nonces = readJson<AuthNonceRow[]>(AUTH_NONCES_FILE, []);
  const next = nonces.map((n) =>
    n.address === address.toLowerCase()
      ? { ...n, consumed_at: new Date().toISOString() }
      : n,
  );
  writeJson(AUTH_NONCES_FILE, next);
}

// ---------------------------------------------------------------------------
// Student Identities (KYC)
// ---------------------------------------------------------------------------

export interface StudentIdentityRow {
  wallet_address: string;
  verified_email: string;
  verified_at: string;
}

export async function getStudentIdentity(walletAddress: string): Promise<StudentIdentityRow | null> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from('student_identities')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data as StudentIdentityRow | null;
  }
  
  const identities = readJson<StudentIdentityRow[]>(path.join(DATA_DIR, 'student_identities.json'), []);
  return identities.find(i => i.wallet_address === walletAddress.toLowerCase()) ?? null;
}

export async function createStudentIdentity(walletAddress: string, verifiedEmail: string): Promise<void> {
  if (hasSupabase()) {
    const db = getSupabaseAdmin();
    const { error } = await db.from('student_identities').upsert({
      wallet_address: walletAddress.toLowerCase(),
      verified_email: verifiedEmail
    });
    if (error) throw error;
    return;
  }

  const file = path.join(DATA_DIR, 'student_identities.json');
  const identities = readJson<StudentIdentityRow[]>(file, []);
  const index = identities.findIndex(i => i.wallet_address === walletAddress.toLowerCase());
  const row = {
    wallet_address: walletAddress.toLowerCase(),
    verified_email: verifiedEmail,
    verified_at: new Date().toISOString()
  };
  if (index >= 0) identities[index] = row;
  else identities.push(row);
  writeJson(file, identities);
}

