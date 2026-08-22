# VeriCred

**Instant, self-sovereign academic credential verification.**

VeriCred replaces paper transcripts, degree certificates, and migration certificates with tamper-proof, non-transferable **Soulbound Tokens**. Universities issue credentials in seconds; students own them and grant revocable, expiring access; employers, universities, and embassies verify them wallet-free — no login, no intermediary, no emailing a registrar.

> **The Trinity of Trust:** the blockchain proves a credential is *real*, the AI proves it is *not fake*, and the student's grant proves it is *consented*.

---

## Why this matters

Academic verification in India is slow, opaque, and easy to game.

| Fact | Source |
|------|--------|
| ~20 lakh (2 million) fake degrees circulate in India's job market | UGC estimates |
| Background-verification fraud is a **$564bn** problem | IBS Intelligence |
| AI-enabled document fraud rose **456%** in one year | TRM Labs / Sumsub |
| ~100,000 fake degrees linked to H-1B visa scrutiny | American Bazaar |

The existing solutions are centralized (DigiLocker/NAD), issuer-centric (Blockcerts), or manual (WES/email verification). VeriCred is different: **the student — not the institution — controls who sees the credential and for how long.**

| Failure | VeriCred fix |
|---------|--------------|
| **Slow** (weeks of chasing clerks) | Issue and verify in seconds |
| **Corruptible** (gatekeepers) | No intermediary can block, delay, or forge |
| **Fragile** (lost paper) | Credential lives on-chain, outlives the issuer |
| **Untrustworthy** (forgery) | Tamper-evident hash anchoring + AI fraud detection |

---

## How it works

1. **Issue** — a university builds a credential, hashes it with `keccak256`, and mints a Soulbound Token to the student's wallet.
2. **Hold** — the student owns the token. It cannot be transferred or sold.
3. **Grant** — the student signs an EIP-712 permission grant with an expiry, then shares a QR or link.
4. **Verify** — anyone scans or pastes the credential. The engine recomputes the hash, checks the on-chain registry and grant, and returns **VALID / TAMPERED / REVOKED / EXPIRED / DENIED** in under 5 seconds.
5. **AI risk screen** — a risk engine scores the issuer's on-chain behavior (mass issuance, synthetic issuers, template entropy) on a 0–100 scale.

> [!NOTE]
> Verification is **wallet-free**. It runs against a read-only RPC node, so it works in incognito and even if the VeriCred web app itself is offline — the blockchain, not the website, is the source of truth.

---

## The three roles

- **Issuer (University Registrar)** — issue, revoke, and accept migration certificates from a dashboard. Optional AI OCR auto-fills legacy documents.
- **Student (Holder)** — view credentials in a vault, share via QR/link, present migration certificates, revoke access, and see an access log.
- **Verifier (Employer / University / Embassy)** — verify any credential with no wallet and no login.

---

## Key features

- **Soulbound credentials** — non-transferable ERC-721 tokens (OpenZeppelin `AccessControl`).
- **Wallet-free verification** — read-only RPC, no MetaMask required for verifiers.
- **Migration certificates as two-party documents** — `issued → presented → accepted` lifecycle on-chain.
- **Revocable, expiring grants** — EIP-712 signed by the student, bound to a verifier.
- **Access log** — students see exactly who viewed a credential and when.
- **AI risk engine** — deterministic on-chain anomaly scoring with an optional real LLM oracle (Gemini or OpenAI) and signed risk attestations.
- **Batch issuance** — mint many credentials in one contract call.
- **SIWE issuer auth** — "Sign-In with Ethereum" (EIP-4361) with an HttpOnly session cookie.
- **Simulated student identity binding** — OTP + email KYC flow, explicitly labeled as a simulation (real Aadhaar e-KYC requires government partnership).
- **Zero-setup local fallbacks** — the demo runs without Supabase or Pinata; JSON files and a deterministic local CID are used when those services are absent.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Wallet | RainbowKit + wagmi + viem |
| Smart contract | Solidity + Hardhat + OpenZeppelin (ERC-721 + AccessControl) |
| Chain | Hardhat local (default), Polygon Amoy, or Sepolia |
| Storage | IPFS via Pinata (optional) with a deterministic local CID fallback |
| Database | Supabase Postgres (optional) with a local JSON fallback |
| Auth | SIWE (EIP-4361) + HttpOnly cookies |
| AI / OCR | Gemini or OpenAI (optional oracle) + Tesseract.js for OCR auto-fill |
| Testing | Vitest (app logic) + Hardhat/Chai (contract) |

---

## Getting started

### Prerequisites

- Node.js 22+
- npm
- MetaMask browser extension (issuer and student roles only; verifier needs none)

### 1. Install

```bash
npm install
```

### 2. Run locally (zero-setup demo, recommended)

```bash
cd contracts
npm install
npm run node        # starts a Hardhat node at http://127.0.0.1:8545
```

In a second terminal:

```bash
cd contracts
npm run deploy:local
npm run seed        # mints 3 demo credentials and writes data/credentials.json
```

In a third terminal, from the project root:

```bash
npm run build
npm run start
```

Open `http://localhost:3000`.

> [!IMPORTANT]
> Prefer `npm run build && npm run start` over `npm run dev`. A `NODE_ENV=production` shell variable can break Next.js dev mode in some environments.

### 3. Connect the demo wallets

1. In MetaMask, add a custom network: **Localhost 8545**, chain ID **31337**.
2. Import **Hardhat Account 0** (the issuer) and **Hardhat Account 1** (the student) using the private keys printed by `npm run node`.

---

## Demo script (4.5 minutes)

1. **Issue** — open `/issuer`, connect the issuer wallet, fill the Migration Certificate form, and click Sign & Mint. Optionally use AI OCR to auto-fill a legacy document.
2. **Hold** — open `/student`, enter any 6-digit OTP (the flow is simulated), and see the new credential in the vault.
3. **Grant** — click "Generate Proof Link", choose a 24-hour expiry, and sign the EIP-712 grant. A QR code is generated.
4. **Verify** — open `/verify`, scan the QR or paste the JSON. The result shows a green **VALID** badge.
5. **Accept migration** — connect a different university wallet and click **ACCEPT MIGRATION** to complete the on-chain handshake.
6. **Revoke** — return to `/student`, view the access log, then click **Revoke Access Link**. Scanning the same QR again now fails with **ACCESS DENIED**.

> [!TIP]
> The strongest single beat: after sharing, the student sees *exactly who opened the credential and when*, then revokes it live. "You shared it, you saw who opened it, you took it back. The clerk never could."

---

## AI risk engine

The core trust path is **deterministic** — a hash match is a hash match. On top of that, the risk engine reads issuer-level counters stored on-chain and flags suspicious patterns:

- **Mass issuance anomaly** — 5,000 credentials minted in under an hour.
- **Template entropy** — thousands of credentials sharing identical metadata.
- **Synthetic issuer** — a brand-new issuer that appears, mints a burst, and disappears.
- **Duplicate hash** — the same credential hash reused with different names.

By default this uses a fast, deterministic rule engine (no API keys needed). If `GEMINI_API_KEY` or `OPENAI_API_KEY` is set, the `/api/oracle/risk` route calls a real model and returns a signed risk attestation instead. Run the diploma-mill simulation to demo the 92/100 risk score:

```bash
cd contracts
npm run simulate-diploma-mill
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Everything is optional for the local demo.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_RPC_URL` | No | RPC endpoint (defaults to local Hardhat) |
| `NEXT_PUBLIC_CHAIN_ID` | No | `31337` (Hardhat), `80002` (Amoy), `11155111` (Sepolia) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | No | Overrides the deployed contract address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | RainbowKit WalletConnect support |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | No | Persistent Postgres (falls back to JSON files) |
| `PINATA_JWT` / `PINATA_GATEWAY` | No | Real IPFS upload (falls back to local CID) |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | No | Real AI oracle (falls back to deterministic rules) |
| `ORACLE_PRIVATE_KEY` | No | Private key for signing AI risk attestations |
| `JWT_SECRET` | No | Secret for the student KYC JWT |

---

## Production deployment (free tier)

The app runs entirely on free tiers: **Vercel Hobby** (hosting), **Supabase free Postgres** (database), **Polygon Amoy** (testnet), a free **Alchemy/QuickNode RPC**, and **WalletConnect Cloud** (free project ID).

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Create a WalletConnect Cloud project and copy the Project ID.
3. Create a free Alchemy/QuickNode Polygon Amoy RPC URL.
4. Copy `.env.example` to `.env.local` and fill in every value.
5. Deploy to Amoy:

   ```bash
   cd contracts && npm install && npm run deploy:amoy
   ```

6. Seed the database:

   ```bash
   npm run db:seed
   ```

7. Push to Vercel with the same environment variables configured in the dashboard.

---

## Testing

```bash
npm test                        # app logic: hashing, verification, AI risk
cd contracts && npm test        # contract: 16 tests (issue, verify, revoke, migration, batch, soulbound)
```

---

## Security model

- **Forgery** — hash anchoring; one changed character produces a different hash and fails.
- **Unauthorized issuance** — `onlyIssuer` role enforced by OpenZeppelin `AccessControl`.
- **Theft** — Soulbound tokens cannot be transferred or sold.
- **Replay / stale copies** — revocation is a live on-chain flag checked on every read.
- **Privacy** — selective, expiring grants and per-verifier access logging.
- **Availability** — verification survives API downtime because it reads the chain directly.

> [!NOTE]
> **Honesty principle.** VeriCred is a UI, not a gatekeeper. The trust anchors are the issuer's signature, the on-chain registry, and the student's grant signature — not the VeriCred website.

---

## Project structure

```
vericred/
├── app/                     # Next.js App Router
│   ├── page.tsx             # landing / verifier hero
│   ├── verify/              # wallet-free verification
│   ├── student/             # student vault + grants
│   ├── issuer/              # university issuance + revocation
│   └── api/                 # credentials, auth, access-logs, oracle, kyc, upload
├── components/              # seal, credential card, risk badge, wallet UI, home sections
├── lib/                     # hashing, verification, AI risk, contract client, DB, types
├── contracts/               # Hardhat + Solidity (CredentialSBT)
├── data/                    # local JSON persistence (zero-setup fallback)
├── supabase/                # production Postgres schema
├── scripts/                 # DB seed helpers
└── docs/                    # solution brief + architecture diagrams + plans
```

---

## Judging criteria mapping

| Criterion | Where VeriCred delivers |
|-----------|--------------------------|
| **Innovation** | The Trinity of Trust — real + not-fake + consented — plus migration certificates as two-party on-chain documents |
| **Technical merit** | Soulbound tokens, EIP-712 grants, wallet-free verification, on-chain AI signals, signed risk attestations |
| **Real-world impact** | 20 lakh fake degrees, weeks → seconds, in-demo impact counter, zero-fee student tier in the roadmap |
| **Scalability & security** | OpenZeppelin base, batch issuance, read-only verification, live revocation, network-effect trust graph |
| **AI impact** | AI as the blockchain's "immune system" — it finds fraud *networks*, not just fake documents |

---

## Roadmap

- **★ MVP (built)** — three-role app, SBT issuance, QR sharing, wallet-free verify, revocation, migration docType, batch mint, expiring grants, simulated identity binding.
- **★★ Demo-wow** — Verify-to-Admit flow, records-outlive-issuer demo, AI immune-system demo, two-university network, impact counter.
- **★★★ Vision** — BBS+/SD-JWT selective disclosure, W3C DID compliance, verifiable AI (signed attestations + zkML), on-chain trust graph, DigiLocker/Aadhaar interop.

---

## Documentation

- **`docs/SOLUTION-BRIEF.md`** — full solution brief, judging-criteria mapping, and staged roadmap.
- **`docs/ARCHITECTURE.md`** — ASCII architecture and flow diagrams.
- **`docs/ARCHITECTURE-MERMAID.md`** — Mermaid.js architecture diagrams.
- **`docs/COMPREHENSIVE-UI-DESIGN.md`** — design system and UI direction.

---

## What's real vs. simulated

To keep the demo credible and honest:

| Component | Status |
|-----------|--------|
| On-chain issuance, verification, revocation, migration | **Real** (Solidity contract, tested) |
| EIP-712 grants and wallet-free verification | **Real** |
| AI risk engine | **Real** (deterministic rules; optional Gemini/OpenAI oracle) |
| AI OCR auto-fill | **Real** (Tesseract.js) |
| Student OTP identity binding | **Simulated** (OTP `123456`; real Aadhaar e-KYC is a roadmap dependency) |
| IPFS / Supabase persistence | **Real when configured**, with transparent local fallbacks |
