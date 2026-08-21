
                          ┌─────────────────────────────────────────────────────────────────┐
                            │                    VERICRED  ·  TRINITY OF TRUST                │
                            │        blockchain = REAL   AI = NOT-FAKE   grant = CONSENTED    │
                            └─────────────────────────────────────────────────────────────────┘

      ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────────────────────┐
      │   ISSUER APP    │        │  STUDENT WALLET │        │        VERIFIER PORTAL          │
      │  (University)   │        │    (Holder)     │        │  (Employer / Univ / Embassy)    │
      │                 │        │                 │        │                                 │
      │ · Issue form    │        │ · My vault      │        │ · Scan QR / paste JSON          │
      │ · Revoke        │        │ · Share         │        │ · Accept migration              │
      │ · Dashboard     │        │ · QR / link     │        │ · Result card (no wallet)       │
      │ · Activity log  │        │ · Access log    │        │                                 │
      └────────┬────────┘        └────────┬────────┘        └────────────────┬────────────────┘
               │  wallet-signs            │  owns + grants                    │  verifies (read-only)
               │  (MetaMask)              │  (MetaMask)                       │
               ▼                          ▼                                   ▼
            ┌─────────────────────────────────────────────────────────────────────────────────┐
            │                              VERIFICATION ENGINE                              │
            │  1. keccak256(credential JSON)   →  matches on-chain hash?                    │
            │  2. on-chain registry            →  exists? revoked? who issued?              │
            │  3. student grant (EIP-712)      →  signature + expiry + revoke?              │
            │  4. issuer signature             →  valid?                                    │
            │  5. AI risk engine               →  fraud-network anomaly? (0–100 score)      │
            └──────────────────────────────────────────────┬──────────────────────────────────┘
                                                           │
            ┌──────────────────┬───────────────────────────────┬──────────────────┐
            ▼                  ▼                               ▼                  ▼
      ┌─────────────┐   ┌──────────────────┐   ┌────────────────────┐   ┌──────────────────┐
      │ IPFS/Pinata │   │  POLYGON AMOY /  │   │   OFF-CHAIN API    │   │   AI RISK ENGINE │
      │ cred JSON   │   │  HARDHAT LOCAL   │   │   (Next.js)        │   │  · mass issuance │
      │ (CID)       │   │  CredentialSBT   │   │   · share tokens   │   │  · collusion     │
      │             │   │  · issue         │   │   · activity index │   │  · synthetic     │
      │ tamper-     │   │  · verify        │   │   · grant signing  │   │  · template      │
      │ evident     │   │  · revoke        │   │                    │   │   → risk 92/100  │
      │ storage     │   │  · accept migr.  │   │                    │   │   + reason       │
      └─────────────┘   └──────────────────┘   └────────────────────┘   └──────────────────┘
                                 │
                                 │  SOURCE OF TRUTH  (verification works even if API is down)
                                 ▼
            ┌──────────────────────────────────────────────────────────────────────────────┐
            │  RESULT:  ✅ VALID · ❌ TAMPERED · ⚠️ REVOKED · ⏱ EXPIRED · 🚫 DENIED        │
            └──────────────────────────────────────────────────────────────────────────────┘