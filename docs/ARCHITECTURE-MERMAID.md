# VeriCred — Architecture Diagrams (Mermaid)

> Mermaid.js version of the full system architecture.
> Companion to `SOLUTION-BRIEF.md` and `ARCHITECTURE.md`.

---

## 1. High-Level Architecture (everything in one view)

```mermaid
flowchart TB
    subgraph Trinity["TRINITY OF TRUST"]
        direction LR
        POR["PROOF-OF-REAL<br/>blockchain hash + issuer signature"]
        PONF["PROOF-OF-NOT-FAKE<br/>AI fraud detection"]
        POC["PROOF-OF-CONSENT<br/>student EIP-712 grant"]
    end

    subgraph Roles["THREE ROLES"]
        direction LR
        ISSUER["ISSUER APP<br/>(University)<br/>issue · revoke · dashboard"]
        STUDENT["STUDENT WALLET<br/>(Holder)<br/>vault · share · access log"]
        VERIFIER["VERIFIER PORTAL<br/>(Employer / Univ / Embassy)<br/>scan/paste · result · NO wallet"]
    end

    subgraph Engine["VERIFICATION ENGINE"]
        direction TB
        E1["1. keccak256(JSON)"]
        E2["2. on-chain registry<br/>exists? revoked? issuer?"]
        E3["3. grant signature<br/>+ expiry + revoke"]
        E4["4. issuer signature"]
        E5["5. AI risk score 0-100"]
    end

    subgraph Backends["BACKENDS"]
        direction LR
        IPFS["IPFS / Pinata<br/>credential JSON (CID)"]
        CHAIN["POLYGON AMOY /<br/>HARDHAT LOCAL<br/>CredentialSBT<br/>issue · verify · revoke · accept"]
        API["OFF-CHAIN API<br/>(Next.js)<br/>share tokens · activity index"]
        AI["AI RISK ENGINE<br/>mass-issuance · collusion<br/>synthetic issuer · template"]
    end

    RESULT["RESULT<br/>VALID / TAMPERED / REVOKED<br/>EXPIRED / DENIED"]

    ISSUER -->|"wallet signs (MetaMask)"| E1
    STUDENT -->|"owns + grants (MetaMask)"| E3
    VERIFIER -->|"verifies (read-only RPC)"| E1

    E1 --> E2 --> E3 --> E4 --> E5 --> RESULT

    E1 --> IPFS
    E2 --> CHAIN
    E3 --> API
    E5 --> AI

    CHAIN -->|"source of truth (survives API downtime)"| RESULT
```

---

## 2. Issuance Flow (University → Student)

```mermaid
sequenceDiagram
    autonumber
    participant U as University (Issuer)
    participant S as VeriCred System
    participant I as IPFS (Pinata)
    participant B as Blockchain (CredentialSBT)
    participant ST as Student

    U->>S: Fill issue form (name, roll, course, docType)
    S->>S: Build credential JSON (W3C-VC inspired)
    S->>I: Upload JSON → get CID
    I-->>S: CID (content hash)
    S->>S: keccak256(JSON) → hash
    S->>U: Request wallet signature (onlyIssuer check)
    U-->>S: Signed tx
    S->>B: issueCredential(hash, cid, student, docType)
    B-->>ST: Mint SBT (non-transferable) to student wallet
    ST->>ST: Credential appears in vault
```

---

## 3. Permissioned Access Flow (Student → Verifier)

```mermaid
sequenceDiagram
    autonumber
    participant ST as Student (Holder)
    participant S as VeriCred System
    participant V as Verifier (Employer/Univ/Embassy)

    ST->>S: Choose credential + what to reveal + expiry (7/30/90d)
    ST->>S: Sign EIP-712 grant (verifier, credId, expiry)
    S->>S: Store grant + access log
    S-->>ST: Return QR / share link
    ST->>V: Share QR / link
    V->>S: Open link / scan QR
    S->>S: Check grant (signature valid? expired? revoked?)
    alt Grant valid
        S-->>V: Show credential (permitted)
    else Expired or revoked
        S-->>V: Show "EXPIRED" / "DENIED"
    end
```

---

## 4. Verification Flow (wallet-free)

```mermaid
sequenceDiagram
    autonumber
    participant V as Verifier (no wallet)
    participant E as Verification Engine
    participant B as Blockchain (read-only RPC)

    V->>E: Scan QR / paste JSON / open link
    E->>E: Parse credential + optional grant
    E->>E: Recompute keccak256(JSON)
    E->>B: Query: hash exists? revoked? issuer?
    B-->>E: On-chain registry result
    E->>E: Validate issuer signature + grant
    E->>E: AI risk scoring (optional)
    E-->>V: VALID / TAMPERED / REVOKED / EXPIRED / DENIED
```

---

## 5. Migration Certificate (two-party: issue → present → accept)

```mermaid
sequenceDiagram
    autonumber
    participant A as Origin Univ (A)
    participant ST as Student
    participant B as Destination Univ (B)

    A->>ST: Issue migration cert (status: issued)
    ST->>B: Present cert (QR / grant)
    B->>B: Verify: VALID, issued by A
    B->>B: ACCEPT on-chain (status: accepted)
    B-->>ST: Admission form auto-fills
    Note over A,B: "Issued by A, accepted by B" — 2-week paper chase → 5 seconds
```

---

## 6. AI Immune System (fraud-network detection)

```mermaid
flowchart TB
    subgraph Graph["ON-CHAIN TRUST GRAPH"]
        A["Issuer A<br/>normal"]
        B["Issuer B<br/>normal"]
        C["Issuer C<br/>5,000 creds in 1hr<br/>identical template"]
        VX["Verifier X"]
        VY["Verifier Y"]

        A --> VX
        B --> VY
        C -->|"hundreds of verifications"| VY
    end

    Graph --> AI["AI RISK ENGINE"]

    subgraph Signals["DETECTED SIGNALS"]
        S1["mass issuance anomaly"]
        S2["collusion cluster"]
        S3["synthetic issuer"]
        S4["template entropy"]
    end

    AI --> Signals
    Signals --> Score["RISK SCORE: 92/100<br/>'University C issued 5,000 degrees in 1hr<br/>using the same template and metadata —<br/>consistent with a diploma mill.'"]
```

---

## 7. Trust Model (what you actually believe)

```mermaid
flowchart LR
    subgraph Anchors["TRUST ANCHORS"]
        A1["issuer signature"]
        A2["on-chain revocation registry"]
        A3["student grant signature"]
    end

    Anchors --> Truth["VeriCred is a UI, NOT a gatekeeper<br/>verification survives API downtime"]
```

---

## 8. Deployment Topology (free tier)

```mermaid
flowchart TB
    FE["Vercel (Hobby)<br/>Next.js frontend — 3 roles"]

    FE --> RPC["Alchemy / QuickNode RPC (free tier)"]
    FE --> IPFS["IPFS / Pinata (1GB free)<br/>or QR-base64 (zero signup)"]
    FE --> API["Next.js API routes<br/>share tokens · activity · AI"]
    RPC --> CHAIN["Polygon Amoy (testnet)<br/>or Hardhat local node (offline)"]
    API --> CHAIN
```
