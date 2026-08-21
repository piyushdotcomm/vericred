# VeriCred

**Instant Transcript & Migration Verification System**

VeriCred replaces paper academic records with tamper-proof digital credentials. Universities issue transcripts, degree certificates, and migration certificates as Soulbound Tokens (non-transferable NFTs). Students hold their credentials in a wallet and grant instant, revocable access to any verifier. Employers, universities, and embassies verify authenticity in seconds, with no wallet and no intermediary.

> **The Trinity of Trust:** the blockchain proves a credential is *real*, the AI proves it is *not fake*, and the student's grant proves it is *consented*.

---

## The Problem

Getting an official transcript, degree certificate, or migration certificate in India is slow, opaque, and often corrupt. Students wait weeks, chase clerks, and sometimes pay bribes. Paper documents are easy to forge, so receiving institutions run their own slow manual verification.

VeriCred fixes all four failure modes at once:

| Failure | VeriCred fix |
|---------|--------------|
| **Slow** (weeks) | Issue and verify in seconds |
| **Corruptible** (gatekeepers) | No intermediary can block, delay, or forge |
| **Fragile** (lost paper) | Credential lives on-chain, outlives the issuer |
| **Untrustworthy** (forgery) | Tamper-evident hash anchoring + AI fraud detection |

---

## How It Works

1. **Issue** — a university mints a credential to a student's wallet. The credential JSON is hashed (`keccak256`) and anchored on-chain.
2. **Hold** — the student owns the Soulbound Token. It cannot be transferred or sold.
3. **Grant** — the student issues a revocable, expiring permission grant (EIP-712) to a verifier.
4. **Verify** — anyone scans a QR or pastes JSON. The engine recomputes the hash, checks the on-chain registry, and returns **VALID / TAMPERED / REVOKED / EXPIRED / DENIED** in under 5 seconds. No wallet, no login, no emailing anyone.
5. **AI risk screen** — a deterministic risk engine scores credentials for fraud patterns (mass issuance, collusion clusters, synthetic issuers) on a 0–100 scale.

---

## The Three Roles

- **Issuer (University Registrar)** — issue, revoke, and accept migration certificates from a dashboard.
- **Student (Holder)** — view credentials in a vault, share via QR/link, revoke access, and see an access log.
- **Verifier (Employer / University / Embassy)** — verify any credential wallet-free, in seconds.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Smart contract | Solidity + Hardhat + OpenZeppelin (Soulbound ERC-721) |
| Wallet | viem (injected MetaMask connector) |
| Verification | Read-only RPC (no wallet needed) |
| AI risk | Deterministic anomaly-scoring engine |
| Chain | Local Hardhat node (default) or Polygon Amoy (optional) |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- MetaMask browser extension (for issuer/student roles; verifier needs none)

### Install

```bash
npm install
```

### Run (production, recommended)

```bash
npm run build
npm run start
```

Open `http://localhost:3000`.

> **Note:** `npm run dev` may fail if `NODE_ENV=production` is set in your shell. Use `npm run build && npm run start` for a reliable demo.

### Test

```bash
npm test          # unit tests (hash, verify, AI risk)
```

---

## Project Structure

```
vericred/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # fonts + root layout
│   ├── page.tsx          # landing → verifier hero
│   ├── verify/           # wallet-free verifier
│   ├── student/          # student vault
│   └── issuer/           # university issuer portal
├── components/           # seal, credential-card, wallet-connect, risk-badge
├── lib/                  # pure logic (hash, verify, ai-risk, use-wallet, types)
├── docs/                 # solution brief + architecture diagrams
├── contracts/            # Hardhat + Solidity (Soulbound credential contract)
└── ...
```

---

## Documentation

- **`docs/SOLUTION-BRIEF.md`** — complete solution brief, judging-criteria mapping, and scope-of-improvement roadmap (★ MVP / ★★ demo / ★★★ vision).
- **`docs/ARCHITECTURE.md`** — ASCII architecture diagrams.
- **`docs/ARCHITECTURE-MERMAID.md`** — Mermaid.js architecture diagrams.

---

## Design System

Cold institutional registry world, not warm paper craft:

- **Colors:** cool off-white `#F7F8FA`, deep navy `#14293E`, steel blue accent `#0E5A8A`
- **Type:** Space Grotesk (display/body) + IBM Plex Mono (data/hashes)
- **Signature:** "The Seal" — a circular embossed verification stamp that imprints the verdict

---

## License

This project is a hackathon submission. See individual skill files for their respective licenses.
