# Instant Transcript & Migration Verification System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A working demo where a university issues a tamper-proof digital credential (SBT) to a student's wallet, the student holds and shares it, and any third party verifies authenticity in seconds — no emails, no intermediaries, no forgery.

**Architecture:**
- Smart contract (Solidity SBT) on Polygon Amoy testnet anchors the credential hash
- Credential JSON stored on IPFS (Pinata) — hash of it recorded on-chain
- Next.js + TypeScript frontend with 3 roles: Issuer (university), Student (holder), Verifier (public, no wallet needed)
- Verification: recompute hash of presented credential → compare to on-chain registry → valid/revoked/tampered

**Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind, Hardhat + Solidity + OpenZeppelin, viem + RainbowKit, Pinata IPFS, Polygon Amoy testnet, QR code for sharing

**Spec:** Hackathon problem statement — "Instant Transcript & Migration Verification System" (Blockchain / Web3 for Social Impact)

**Timebox:** 24–48 hours (hackathon). Priorities: working demo > polish > extra features. **Honest commitment:** the ★ MVP path (issue → hold → grant → verify) is the committed ~20h deliverable; ★★ demo-wow items (batch mint, offline QR, records-outlive-issuer) are stretch targets layered on only after the end-to-end demo lands.

---

## Global Constraints

- MVP must demo end-to-end: issue → hold → share → verify (this is the win condition)
- Verifier flow must work WITHOUT a wallet (judges won't connect MetaMask)
- All code committed early and often; demo script written before demo day
- No features beyond the core flow (no KYC, no email, no multi-chain) — those are "future work"
- Contract must be secure: only issuer can mint, only issuer can revoke, tamper-evident hash
- Fallback if testnet faucet fails: run a local Hardhat node for the demo

---

## Milestones

| # | Milestone | Target | Owner | Success Criteria |
|---|-----------|--------|-------|------------------|
| 1 | Contract written & tested | Hour 4 | Dev | SBT contract passes Hardhat tests: issue, verify, revoke, tamper-reject |
| 2 | Credentials issued end-to-end via script | Hour 8 | Dev | Seed script issues 3 certs to test wallets on testnet/local node |
| 3 | Student vault: hold & view credentials | Hour 14 | Dev | Connected wallet sees its credentials as certificate cards |
| 4 | Permissioned access: grant, expire, revoke, log | Hour 18 | Dev | Student grants access; verifier sees it; revoke/expiry enforced |
| 5 | Web app: all 3 roles working | Hour 24 | Dev | Issue (wallet), Hold/Share (wallet), Verify (no wallet) all functional |
| 6 | Demo-ready | Hour 30 | Dev | Deployed, seeded, QR works, demo script rehearsed |

---

## Phase 0: Setup (Hours 0–2)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Init Git repo in project root | 0.5h | — | `git init`, initial commit |
| Scaffold Next.js app (TypeScript + Tailwind) | 1h | — | `npm run dev` shows default page |
| Scaffold Hardhat project in `contracts/` | 0.5h | — | `npx hardhat test` runs sample test green |
| Install deps: viem, RainbowKit, wagmi, qrcode.react, pinata SDK | 0.5h | Next.js app | All imports resolve, `npm run build` passes |

**Total Effort**: ~2.5h

---

## Phase 1: Smart Contract (Hours 2–6)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Write `CredentialSBT.sol` (ERC-721 non-transferable via OpenZeppelin) | 2h | Hardhat setup | Compiles; only issuer can mint; `_beforeTokenTransfer` blocks transfers |
| Add credential metadata: issuer, student, hash, docType (transcript/migration), issueDate, revoked flag | 1h | Contract | Struct + events defined |
| Add `issueCredential`, `verifyCredential(bytes32 hash)`, `revokeCredential(tokenId)` | 1h | Contract | Functions exist, access-controlled (onlyIssuer) |
| Write Hardhat tests (TDD): issue → verify true; tamper → verify false; revoke → verify false; transfer → reverts; non-issuer mint → reverts | 2h | Contract | All tests pass (`npx hardhat test`) |
| Deploy script + contract verification config | 1h | Tests green | `deploy:amoy` script runs; ABI exported to frontend `lib/` |

**Total Effort**: ~7h

**Critical path item** — this is the heart of the demo. If Solidity is slow, fall back: deploy on local Hardhat node and demo against it (no faucet needed).

---

## Phase 2: Credential Issuance Pipeline (Hours 6–10)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Define credential JSON schema (W3C-VC-inspired: issuer DID, student, claims, docType, issuedAt) | 0.5h | — | `lib/types.ts` with types |
| Add migration docType schema: `issuedBy`, `presentedTo`, `status` (issued → presented → accepted) | 0.5h | Schema | `MigrationCredential` type + status enum |
| Pinata upload: upload credential JSON, get IPFS CID | 1h | Pinata account | `POST /api/upload` returns CID |
| Hash pipeline: `keccak256(canonical JSON)` + CID recorded on-chain | 1h | Contract + schema | `issue()` called with hash; tx confirmed |
| Seed script: 3 demo students (transcript, migration cert, degree cert) | 1h | Pipeline | `npm run seed` mints 3 SBTs, prints tokenIds |
| `verifyCredential` client: recompute hash from presented JSON, compare on-chain | 1h | Contract | Returns {valid, issuer, student, revoked} |

**Total Effort**: ~4.5h

---

## Phase 3: Frontend — Student Vault (Hours 10–14)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| RainbowKit + wagmi provider setup | 1h | Setup | Connect button works, shows address |
| Student dashboard: fetch SBTs owned by connected wallet (read-only calls) | 2h | Pipeline | Seeded student wallet sees their 3 certs |
| Credential detail view: renders JSON as nice certificate card | 1.5h | Dashboard | Card shows student, degree, issuer, date |

**Total Effort**: ~4.5h

---

## Phase 3b: Permissioned Access — Grant, Expire, Revoke, Log (Hours 14–18)

> This is the centerpiece of the problem statement. Give it its own milestone and demo beat.

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Share: generate shareable link + QR code (contains credential JSON or link to it) | 1.5h | Student Vault | QR scans to verify page with credential loaded |
| Permissioned access: "grant access" creates a signed, **revocable, expiring** grant (EIP-712) | 2h | Share | Grant carries verifier address, credential id, expiry; signature verifies |
| Access log: record who viewed what, when | 1h | Grant | Student sees an access log per credential |
| Revoke: student revokes a grant instantly | 0.5h | Grant | Revoked grant fails verification with "DENIED" |

**Total Effort**: ~5h

---

## Phase 4: Frontend — Issuer (University) Flow (Hours 18–20)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Issuer page: connect as university wallet (onlyIssuer role check) | 0.5h | Contract | Non-issuer gets "not authorized" |
| Issue form: student name, course, roll no, docType, upload/auto-generate JSON | 1.5h | Pipeline | Submit → Pinata upload → tx → success toast |
| Migration accept action: destination university records acceptance of a presented migration cert | 1h | Migration schema | On-chain/signed acceptance flips `status` to `accepted` |
| Issued list + revoke button | 1h | Issue form | Revoke updates on-chain flag; verify reflects it |
| Activity log (last N events from contract) | 1h | Contract | Issue/revoke/accept events listed with timestamps |

**Total Effort**: ~5h

---

## Phase 5: Frontend — Verifier Flow (Hours 20–24)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| Verify page: paste credential JSON OR scan QR OR open shared link | 1h | Share flow | All 3 input methods work |
| Verification result UI: big green VALID / red INVALID / amber REVOKED + details | 1h | Pipeline | Tamper case shows red with "hash mismatch" |
| No-wallet guarantee: all verification via public read-only RPC | 0.5h | Verify page | Works in incognito, no MetaMask |
| Verify page accepts shared token (EIP-712) → shows credential if granted & unexpired | 1.5h | Permissioned access | Expired/denied shows permission error |
| **AI fraud screen (★★ demo-wow):** risk-score classifier — hard-fail on hash/revoke/expiry + anomaly heuristics (unknown issuer, dup hash, velocity, format anomalies) | 1.5h | Verify page | Pasted forged doc shows "FORGED/ANOMALOUS" with reason |

**Total Effort**: ~5.5h

---

## Phase 6: Polish, Deploy & Demo (Hours 24–30)

| Task | Effort | Depends On | Done Criteria |
|------|--------|------------|---------------|
| frontend-design pass: palette, typography, certificate card, empty states | 3h | All flows | UI doesn't look like a template; mobile OK |
| Deploy contract to Amoy (or local node fallback) + seed data | 1h | Phase 2 | Live contract address in config |
| Deploy frontend (Vercel) — env vars set (RPC, Pinata, contract addr) | 1h | Polish | Public URL works |
| Write 4-minute demo script: roles, narrative, fallback plan | 1h | Deploy | Script with exact clicks + what to say |
| README: setup, architecture diagram, demo instructions | 1h | — | Anyone can run from repo |
| Final end-to-end rehearsal + bug fixes | 2h | Everything | Issue→share→verify runs clean twice |

**Total Effort**: ~9h

---

## Dependencies Map

```
Phase 0 (Setup)
   ├──> Phase 1 (Contract) ──> Phase 2 (Pipeline) ──┐
   │                                                ├──> Phase 5 (Verify) ──┐
   ├──> Phase 3 (Student Vault) ──> Phase 3b (Grant)─┘                       ├──> Phase 6 (Polish/Demo)
   └──> Phase 4 (Issuer flow) ───────────────────────────────────────────────┘
```

**Critical Path**: Setup → Contract → Pipeline → Student Vault → Permissioned Access → Verify → Polish → Demo

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Polygon Amoy faucet down / no test ETH | High | Medium | Local Hardhat node as fallback; demo fully works offline |
| Solidity unfamiliar (first contract) | High | Medium | Use OpenZeppelin templates; solidity-security + ethskills skills; start contract first |
| Pinata signup/API issues | Medium | Medium | Fallback: store JSON as base64 in QR + on verifier page; IPFS optional |
| Wallet issues during live demo (extension, network) | Medium | Medium | Rehearse with pre-funded wallet; incognito verify path needs no wallet |
| Scope creep (wanting to add AI fraud detection, etc.) | High | High | Freeze scope after Phase 2; extra ideas go to "future work" slide |

---

## Resource Allocation

| Role | Key Responsibilities |
|------|----------------------|
| You (Dev) | All build tasks; contract, pipeline, frontend |
| AI agent (me) | Scaffold, write contract/tests, UI, seed script, debug via systematic-debugging |
| Skills activated | ethskills, solidity-security, nextjs-react-typescript, frontend-design, TDD, writing/executing-plans |

---

## Execution Loop (per task)

1. Pick next unchecked task
2. Read its Done Criteria — that's the definition of done
3. Use writing-plans-style steps + TDD (test first for contract/logic)
4. Verify: run the command, see the evidence (verification-before-completion)
5. Tick the checkbox, commit, move to next
6. Stop at any blocker: systematic-debugging → root cause first, or escalate to me

---

## Future Work (do NOT build during hackathon)

- **Full AI/OCR document fraud detection** (the ★★ "AI fraud screen" is in scope as a demo-wow; the full OCR + visual + graph anomaly + LLM narrative version is roadmap)
- Multi-chain, mainnet deployment
- Institution onboarding/kyc, email notifications
- Subgraph/indexer for activity history
- **Wallet recovery / key rotation** — guardian/social recovery + issuer-mediated re-issuance (re-mint to new wallet, revoke old token); recovery is issuer-authorized to preserve security
- **Issuer-owned DIDs (did:web)** — replace the single contract as the ultimate trust root, so verification anchors to the institution's identity, not a VeriCred contract (closes the centralization gap)
- **Real Aadhaar e-KYC / DigiLocker identity binding** — requires government partnership; the demo uses a simulated OTP flow only
