# VeriCred — System Architecture (ASCII)

> Complete visual reference for how VeriCred works end-to-end.
> Companion to `SOLUTION-BRIEF.md` and the implementation plan.

---

## 1. The Trinity of Trust (the whole idea in one view)

```
                        EVERY CREDENTIAL IS TRUSTED ONLY WHEN
                        THREE INDEPENDENT PROOFS AGREE

     ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
     │                      │   │                      │   │                      │
     │   PROOF-OF-REAL      │   │   PROOF-OF-NOT-FAKE  │   │   PROOF-OF-CONSENT   │
     │                      │   │                      │   │                      │
     │  "It was issued."    │   │  "It isn't a scam."  │   │  "You may see it."   │
     │                      │   │                      │   │                      │
     │   Blockchain hash    │   │   AI fraud detection │   │  Student's EIP-712   │
     │   + issuer signature │   │   (immune system)    │   │  revocable grant     │
     │                      │   │                      │   │                      │
     └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
                │                          │                          │
                │          KILLS           │          KILLS           │          KILLS
                ▼                          ▼                          ▼
        Forgery, tampering,      Near-perfect AI-generated    Unauthorized access,
        lost/damaged paper       fakes that "look real"       gatekeeper control
```

---

## 2. High-Level System Overview (3 roles + 4 backends)

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                    VERICRED PLATFORM                                  │
│                                                                                       │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────────────┐   │
│   │   ISSUER APP    │    │  STUDENT WALLET │    │       VERIFIER PORTAL           │   │
│   │  (University)   │    │    (Holder)     │    │  (Employer / Univ / Embassy)    │   │
│   │                 │    │                 │    │                                 │   │
│   │  · Issue form   │    │  · My vault     │    │  · Scan QR / paste JSON         │   │
│   │  · Revoke       │    │  · Share        │    │  · Accept migration             │   │
│   │  · Dashboard    │    │  · QR code      │    │  · Result: VALID / TAMPERED /   │   │
│   │  · Activity log │    │  · Access log   │    │    REVOKED / EXPIRED / DENIED   │   │
│   └────────┬────────┘    └────────┬────────┘    └────────────────┬────────────────┘   │
│            │  wallet-signs        │  owns + grants               │  verifies          │
│            │  (MetaMask)          │  (MetaMask)                  │  (NO wallet)       │
│            │                      │                              │                    │
│            ▼                      ▼                              ▼                    │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│   │                              VERIFICATION ENGINE                                │ │
│   │                                                                                 │ │
│   │   1. Recompute keccak256 hash of presented credential                          │ │
│   │   2. Compare against on-chain registry (exists? revoked? who issued?)          │ │
│   │   3. Validate student's grant signature + expiry (permissioned access)         │ │
│   │   4. Validate issuer signature (EIP-712 / on-chain)                            │ │
│   └───────────────────────────────┬─────────────────────────────────────────────────┘ │
│                                   │                                                  │
│        ┌──────────────────────────┼──────────────────────────┐                       │
│        ▼                          ▼                          ▼                       │
│  ┌──────────────┐      ┌─────────────────────┐      ┌───────────────────┐           │
│  │ IPFS (Pinata)│      │  POLYGON AMOY /     │      │  OFF-CHAIN API    │           │
│  │  Credential  │      │  HARDHAT LOCAL      │      │  (Next.js server) │           │
│  │  JSON (CID)  │      │  CredentialSBT      │      │                   │           │
│  │              │      │  contract           │      │  · share-token    │           │
│  │  tamper-     │      │  (source of truth)  │      │    signing        │           │
│  │  evident     │      │  · issue            │      │  · activity index │           │
│  │  storage     │      │  · verify           │      │  · AI risk engine │           │
│  │              │      │  · revoke           │      │                   │           │
│  │              │      │  · accept migration │      │                   │           │
│  └──────────────┘      └─────────────────────┘      └───────────────────┘           │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flow A — Credential Issuance (University → Student)

```
  UNIVERSITY (Issuer)                      SYSTEM                          STUDENT
        │                                    │                                │
        │ 1. Fill issue form                 │                                │
        │    (name, roll no, course,         │                                │
        │     docType, PDF optional)         │                                │
        │───────────────────────────────────▶│                                │
        │                                    │ 2. Build credential JSON        │
        │                                    │    (W3C-VC inspired)            │
        │                                    │                                │
        │                                    │ 3. Upload JSON to IPFS          │
        │                                    │    → get CID (content hash)     │
        │                                    │                                │
        │                                    │ 4. keccak256(JSON) → hash       │
        │                                    │                                │
        │ 5. Wallet signs tx                 │                                │
        │    (onlyIssuer role check)         │                                │
        │◀───────────────────────────────────│                                │
        │───────────────────────────────────▶│                                │
        │                                    │ 6. issueCredential(             │
        │                                    │      hash, cid, student,        │
        │                                    │      docType)                   │
        │                                    │    → mint SBT to student        │
        │                                    │────────────────────────────────▶│
        │                                    │                                │ 7. Credential
        │                                    │                                │    appears in vault
        │                                    │                                │
```

---

## 4. Flow B — Permissioned Access (Student → Verifier)

```
    STUDENT (Holder)                        SYSTEM                        VERIFIER
          │                                   │                               │
          │ 1. Choose credential to share     │                               │
          │                                   │                               │
          │ 2. Choose what to reveal          │                               │
          │    (full / selective)             │                               │
          │                                   │                               │
          │ 3. Set expiry (7/30/90 days)      │                               │
          │                                   │                               │
          │ 4. Sign EIP-712 grant             │                               │
          │    (verifier addr, cred id,       │                               │
          │     expiry)                       │                               │
          │──────────────────────────────────▶│                               │
          │                                   │ 5. Store grant + access log    │
          │                                   │                               │
          │ 6. Get QR / share link            │                               │
          │◀──────────────────────────────────│                               │
          │                                   │                               │
          │        ───────────  share QR / link ───────────▶                   │
          │                                   │                               │
          │                                   │                               │ 7. Scan / open link
          │                                   │                               │
          │                                   │ 8. Check grant:               │
          │                                   │    · signature valid?         │
          │                                   │    · not expired?             │
          │                                   │    · not revoked?             │
          │                                   │───────────────────────────────▶│
          │                                   │                               │ 9. See credential
          │                                   │                               │    (if granted)
          │                                   │                               │
```

---

## 5. Flow C — Verification (Verifier → result, no wallet needed)

```
      VERIFIER (no wallet)                        VERIFICATION ENGINE
             │                                            │
             │ 1. Scan QR / paste JSON / open link        │
             │───────────────────────────────────────────▶│
             │                                            │
             │                                            │ 2. Parse credential
             │                                            │    + optional grant
             │                                            │
             │                                            │ 3. Recompute keccak256(JSON)
             │                                            │
             │                                            │ 4. Read on-chain (read-only RPC):
             │                                            │    · does hash exist?
             │                                            │    · is it revoked?
             │                                            │    · who issued it?
             │                                            │
             │                                            │ 5. Validate issuer signature
             │                                            │
             │                                            │ 6. Validate grant (if required)
             │                                            │
             │                                            │ 7. AI risk scoring (optional)
             │                                            │
             │◀───────────────────────────────────────────│
             │                                            │
             │  RESULT (in <5 seconds):                   │
             │                                            │
             │   VALID     (green)                      │
             │   TAMPERED  (red)                        │
             │   REVOKED   (amber)                      │
             │   EXPIRED    (gray)                       │
             │  🚫 DENIED    (no grant)                   │
             │                                            │
```

---

## 6. Flow D — Migration Certificate (two-party document: Issue → Present → Accept)

```
   ORIGIN UNIV (A)          STUDENT          DESTINATION UNIV (B)
        │                       │                        │
        │ 1. Issue migration    │                        │
        │    cert (docType=     │                        │
        │    migration)         │                        │
        │──────────────────────▶│                        │
        │                       │                        │
        │                       │ 2. Holds cert          │
        │                       │    (status: issued)    │
        │                       │                        │
        │                       │ 3. Shares + QR         │
        │                       │────────────────────────▶│
        │                       │                        │
        │                       │                        │ 4. Verify: VALID,
        │                       │                        │    issued by A
        │                       │                        │
        │                       │                        │ 5. ACCEPT on-chain
        │                       │                        │    (status: accepted)
        │                       │                        │
        │                       │◀────────────────────────│
        │                       │                        │
        │                       │ 6. Admission form       │
        │                       │    auto-fills          │
        │                       │                        │
```

---

## 7. Flow E — AI Immune System (fraud-network detection)

```
                        ON-CHAIN TRUST GRAPH
   ┌─────────────────────────────────────────────────────────────────────┐
   │                                                                     │
   │   ISSUER A ──issued──▶ CREDENTIALS ──verified-by──▶ VERIFIER X      │
   │   ISSUER B ──issued──▶ CREDENTIALS ──verified-by──▶ VERIFIER Y      │
   │   ISSUER C ──issued──▶ 5,000 creds in 1 hr (identical template)    │
   │                        ──verified-by──▶ VERIFIER Y (same as B)      │
   │                                                                     │
   └─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │  AI reads the graph
                                   ▼
                    ┌────────────────────────────────┐
                    │       AI RISK ENGINE           │
                    │                                │
                    │  · Mass issuance anomaly       │
                    │  · Collusion cluster           │
                    │  · Synthetic issuer            │
                    │  · Template entropy            │
                    │  · Duplicate-hash patterns     │
                    │                                │
                    └────────────────────────────────┘
                                   │
                                   ▼
                        RISK SCORE: 92 / 100
                   "University C issued 5,000 degrees
                    in 1 hour using the same template
                    and metadata — consistent with a
                    diploma mill."
```

---

## 8. Trust & Security Model

```
                      TRUST ANCHOR (who/what you actually believe)

   ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │  Issuer's own      │   │  On-chain          │   │  Student's own     │
   │  signature         │   │  revocation        │   │  grant signature   │
   │  (cryptographic)   │   │  registry          │   │  (EIP-712)         │
   └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬──────────┘
             │                        │                        │
             └──────────────┬─────────┴────────────┬───────────┘
                            │                      │
                            ▼                      ▼
                 ┌──────────────────┐    ┌──────────────────┐
                 │  VeriCred is a   │    │  Verification    │
                 │  UI, NOT a       │    │  works even if   │
                 │  gatekeeper      │    │  our API is down │
                 └──────────────────┘    └──────────────────┘

        KEY HONESTY PRINCIPLE:
        The trust is in the signatures + the chain, not in our website.
```

---

## 9. The Full Data Flow (one credential, end to end)

```
 ┌────────┐     ┌────────┐     ┌──────────┐     ┌──────────┐     ┌────────────┐
 │ISSUER  │     │ IPFS   │     │ BLOCKCHAIN│    │ STUDENT  │     │ VERIFIER   │
 └───┬────┘     └───┬────┘     └────┬─────┘     └────┬─────┘     └─────┬──────┘
     │              │               │                │                  │
     │  build JSON  │               │                │                  │
     │─────────────▶│               │                │                  │
     │              │  return CID   │                │                  │
     │◀─────────────│               │                │                  │
     │              │               │                │                  │
     │  hash(JSON) + CID + student + docType                          │
     │─────────────────────────────▶│                │                  │
     │              │               │  mint SBT      │                  │
     │              │               │───────────────▶│                  │
     │              │               │                │  holds credential│
     │              │               │                │                  │
     │              │               │                │  grant access    │
     │              │               │                │─────────────────▶│
     │              │               │                │                  │
     │              │               │  verify(hash)  │                  │
     │              │               │◀──────────────────────────────────│
     │              │               │                │                  │
     │              │               │  ✅ VALID / ❌ TAMPERED / ⚠️ REVOKED│
     │              │               │──────────────────────────────────▶│
```

---

## 10. Deployment Topology (free-tier / hackathon)

```
                        ┌─────────────────────────────┐
                        │         VERCEL (Hobby)      │
                        │   Next.js frontend (3 roles)│
                        └──────────────┬──────────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
   ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
   │  Polygon Amoy    │     │  IPFS (Pinata)   │     │  Next.js API     │
   │  (testnet)       │     │  (1GB free)      │     │  routes (server) │
   │  OR              │     │                  │     │                  │
   │  Hardhat local   │     │  OR              │     │  · share-token   │
   │  node (offline)  │     │  QR-base64       │     │  · activity index│
   │  (zero signup)   │     │  (zero signup)   │     │  · AI risk engine│
   └──────────────────┘     └──────────────────┘     └──────────────────┘
                                       │
                              ┌────────┴────────┐
                              │  Alchemy /      │
                              │  QuickNode RPC  │
                              │  (free tier)    │
                              └─────────────────┘
```

---

## Key invariants (the rules that make it secure)

- **Only the registered issuer can mint** (`onlyIssuer` role).
- **SBTs are non-transferable** — a credential cannot be sold or moved.
- **Hash is the source of truth** — one changed character = different hash = FAIL.
- **Revocation is a live on-chain flag** — verified on every read.
- **Verification needs no wallet** — read-only RPC, works in incognito.
- **The chain outlives the issuer and us** — verification survives API downtime.
