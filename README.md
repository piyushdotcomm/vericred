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
## Judging criteria mapping

| Criterion | Where VeriCred delivers |
|-----------|--------------------------|
| **Innovation** | The Trinity of Trust — real + not-fake + consented — plus migration certificates as two-party on-chain documents |
| **Technical merit** | Soulbound tokens, EIP-712 grants, wallet-free verification, on-chain AI signals, signed risk attestations |
| **Real-world impact** | 20 lakh fake degrees, weeks → seconds, in-demo impact counter, zero-fee student tier in the roadmap |
| **Scalability & security** | OpenZeppelin base, batch issuance, read-only verification, live revocation, network-effect trust graph |
| **AI impact** | AI as the blockchain's "immune system" — it finds fraud *networks*, not just fake documents |


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



