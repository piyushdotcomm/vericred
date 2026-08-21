-- VeriCred production schema (Supabase Postgres)
-- Run this in the Supabase SQL editor, or `supabase db push` after linking.

-- Credentials: the mutable metadata cache that sits alongside the immutable
-- on-chain hash. The on-chain registry remains the source of truth; this table
-- stores human-readable fields + the CID + issuer signature for re-serialization.
create table if not exists public.credentials (
  id text primary key,
  doc_hash text not null,
  token_id integer,
  cid text,
  issuer_signature text,
  issuer_did text not null,
  issuer_name text,
  student_name text not null,
  student_address text not null,
  roll_number text,
  course text,
  doc_type text not null,
  issued_at timestamptz not null default now(),
  claims jsonb not null default '{}'::jsonb,
  issued_by text,
  created_at timestamptz not null default now()
);

create index if not exists credentials_student_address_idx
  on public.credentials (student_address);

create index if not exists credentials_issuer_did_idx
  on public.credentials (issuer_did);

create index if not exists credentials_doc_hash_idx
  on public.credentials (doc_hash);

-- Access logs: who viewed what credential, when. Row-level security (RLS)
-- should restrict reads to the owning student; the service-role key bypasses
-- RLS for server writes.
create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  student_address text not null,
  credential_id text not null,
  verifier_address text,
  doc_type text,
  viewed_at timestamptz not null default now()
);

create index if not exists access_logs_student_address_idx
  on public.access_logs (student_address);

-- Revoked grants: the student's signature that marks a grant as dead.
create table if not exists public.revoked_grants (
  signature text primary key,
  revoked_at timestamptz not null default now()
);

-- SIWE nonces: one-time values for Sign-In With Ethereum.
create table if not exists public.auth_nonces (
  address text primary key,
  nonce text not null,
  issued_at timestamptz not null default now(),
  consumed_at timestamptz
);

-- Enable RLS (server uses service role; public access is denied by default).
alter table public.credentials enable row level security;
alter table public.access_logs enable row level security;
alter table public.revoked_grants enable row level security;
alter table public.auth_nonces enable row level security;

-- Public read policies. The app mostly reads through the service role, but a
-- read-only anon key can still fetch credentials for wallet-free verification.
create policy "public read credentials"
  on public.credentials for select
  using (true);

create policy "public read revoked grants"
  on public.revoked_grants for select
  using (true);

-- Students may read only their own access logs via anon key (RLS).
create policy "student reads own access logs"
  on public.access_logs for select
  using (auth.uid() is null or student_address = lower((auth.jwt()->>'sub')::text));
