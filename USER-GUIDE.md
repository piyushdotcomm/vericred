# VeriCred — Complete User Guide

**A step-by-step walkthrough for every role: Issuer, Student, and Verifier.**

This guide explains everything a new visitor needs: how to get the platform running, how "signing up" works (spoiler: there are no passwords), and how to use every feature in the app — issuing credentials, sharing them safely, verifying them, and revoking access.

> [!NOTE]
> New to VeriCred? Read [README.md](./README.md) first for the big picture ("Trinity of Trust"), then come back here for the hands-on walkthrough.

---

## Table of contents

1. [What you can do here](#1-what-you-can-do-here)
2. [Who needs what](#2-who-needs-what)
3. [How accounts & sign-in work](#3-how-accounts--sign-in-work)
4. [Getting started (local setup)](#4-getting-started-local-setup)
5. [Connecting your demo wallets](#5-connecting-your-demo-wallets)
6. [Role 1 — University / Issuer](#6-role-1--university--issuer)
7. [Role 2 — Student / Holder](#7-role-2--student--holder)
8. [Role 3 — Verifier / Employer](#8-role-3--verifier--employer)
9. [Understanding verification results](#9-understanding-verification-results)
10. [The AI risk engine](#10-the-ai-risk-engine)
11. [Feature map — what to use for what](#11-feature-map--what-to-use-for-what)
12. [Troubleshooting & FAQ](#12-troubleshooting--faq)

---

## 1. What you can do here

VeriCred replaces paper transcripts, degree certificates, and migration certificates with tamper-proof **Soulbound Tokens** (non-transferable NFTs) anchored on-chain.

| You are… | You can… |
|---|---|
| **A university (Issuer)** | Mint credentials to student wallets in seconds, revoke them if needed, and audit every event on-chain |
| **A student (Holder)** | Own your records forever, share them via QR/link with an expiring permission grant, see exactly who viewed them, and take access back anytime |
| **An employer / university / embassy (Verifier)** | Check any credential in under 5 seconds — **no wallet, no login, no account required** |

---

## 2. Who needs what

| Requirement | Issuer | Student | Verifier |
|---|---|---|---|
| MetaMask wallet | ✅ Required | ✅ Required | ❌ Not needed |
| Account / email signup | ❌ None (wallet = identity) | ❌ None (simulated OTP only) | ❌ None |
| Gas fees | Yes (tiny; free on local/testnet) | Only when presenting migration certs | Never |

> [!TIP]
> Verification is completely wallet-free. It reads the blockchain directly through a public RPC node — it even works in incognito mode.

---

## 3. How accounts & sign-in work

VeriCred has **no traditional registration form**. Identity is cryptographic:

- **Issuers** prove they are a university by connecting a wallet that holds the `ISSUER_ROLE` on the smart contract, then signing in once via **Sign-In with Ethereum (SIWE)** — a single signature click, no password.
- **Students** prove ownership by connecting the wallet their credential was minted to, plus a one-time **simulated OTP identity binding** (see below).
- **Verifiers** never sign in. Anyone with a link or QR code can verify instantly.

### About the student OTP screen

When you first open the Student Vault you will see a "Simulated Aadhaar e-KYC" gate asking for a university email and a 6-digit OTP.

> [!IMPORTANT]
> This is an honest **demo simulation**. Enter **any email** and the OTP **`123456`**. Real Aadhaar biometric e-KYC requires a government partnership and is on the roadmap — we deliberately don't fake it.

Once verified, a secure HttpOnly session cookie is issued (valid 30 days), so you won't be asked again on the same browser.

---

## 4. Getting started (local setup)

Everything runs on a free, zero-setup local stack. No API keys, no cloud services needed.

### Prerequisites

- Node.js 22+ and npm
- MetaMask browser extension (issuer and student roles only)

### Step 1 — Install dependencies

```bash
npm install
cd contracts && npm install && cd ..
```

### Step 2 — Start the local blockchain (terminal 1)

```bash
cd contracts
npm run node        # Hardhat node at http://127.0.0.1:8545
```

Keep this terminal running. It prints 20 test accounts with private keys — you'll use two of them shortly.

### Step 3 — Deploy the contract and seed demo data (terminal 2)

```bash
cd contracts
npm run deploy:local
npm run seed        # mints 3 demo credentials (degree, transcript, migration)
```

### Step 4 — Run the web app (terminal 3)

From the project root:

```bash
npm run build
npm run start       # open http://localhost:3000
```

> [!IMPORTANT]
> Prefer `npm run build && npm run start` over `npm run dev`. In some environments a stray `NODE_ENV=production` shell variable breaks Next.js dev mode.

You now have a fully working VeriCred instance with 3 seeded credentials.

<details>
<summary>Optional services (all have automatic fallbacks)</summary>

Copy `.env.example` to `.env.local` and fill in any of these — **everything works without them**:

| Variable | Unlocks | Without it |
|---|---|---|
| `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_CONTRACT_ADDRESS` | Polygon Amoy / Sepolia instead of local chain | Defaults to local Hardhat |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Mobile wallet connections ([free ID](https://cloud.walletconnect.com)) | Browser-extension wallets only |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Persistent Postgres storage | Local JSON files in `data/` |
| `PINATA_JWT` + `PINATA_GATEWAY` | Real IPFS uploads | Deterministic local CID |
| `GEMINI_API_KEY` or `OPENAI_API_KEY` | LLM-backed AI risk oracle | Deterministic rule engine |
| `ORACLE_PRIVATE_KEY` | Signed AI risk attestations | Unsigned risk reports |
| `JWT_SECRET` | Custom KYC session secret | Built-in demo default |

</details>

---

## 5. Connecting your demo wallets

To play both the issuer and student roles locally:

1. Open MetaMask → add a custom network:
   - Network name: **Localhost 8545**
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: **31337**
   - Currency: ETH
2. Import two accounts from the private keys printed by `npm run node`:
   - **Hardhat Account 0** → this will be the *university issuer*
   - **Hardhat Account 1** → this will be the *student*

> [!TIP]
> Use one browser profile for the issuer and another (or an incognito window) for the verifier — the verifier doesn't need any wallet at all.

---

## 6. Role 1 — University / Issuer

Open **`http://localhost:3000/issuer`**

### 6.1 Sign in

1. Click the wallet button and connect **Account 0**.
2. The app checks on-chain whether your wallet holds the `ISSUER_ROLE`.
   - If yes → the dashboard opens.
   - If not → you'll see *"Access Denied"* (this is the security model working — only registered institutions can mint).
3. The first time you issue, a **Sign-In with Ethereum** popup asks for one signature. That's the whole login.

### 6.2 Issue a credential

Fill the **Issue New Asset** form:

| Field | Example |
|---|---|
| Student Name | `Aisha Verma` |
| Student ID / Roll No. | `2021CS045` |
| Student Wallet Address | `0x…` (the student's wallet — Account 1 locally) |
| Program / Course | `B.Tech Computer Science` |
| Asset Type | Degree Certificate · Transcript · Migration Certificate |

Then click **Sign & Mint Asset**. Behind the scenes:

1. Your credential is built as structured JSON.
2. It is uploaded to storage (IPFS if configured, local fallback otherwise) → returns a content CID.
3. A `keccak256` hash of the JSON is computed.
4. Your wallet signs the transaction → the contract mints a **Soulbound Token** directly to the student's wallet.
5. A success toast shows the transaction hash.

> [!TIP]
> **AI OCR auto-fill:** upload an image of a legacy paper document in the dashed drop zone and Tesseract.js reads the student name and course automatically, pre-filling the form. Always review before minting.

### 6.3 Manage issued credentials

The **Issued Credentials** table lists everything you've minted:

- **Status badge** — `ACTIVE` or `REVOKED`, read live from the chain.
- **Copy JSON** — copies the raw credential payload (handy for testing the verifier page yourself).
- **Revoke** — permanently invalidates a credential (e.g., error, disciplinary action). One confirmation click, one transaction. Every future verification immediately fails with `REVOKED`.

### 6.4 Audit trail

The **Protocol Activity Log** streams real blockchain events (`ISSUED`, `REVOKED`, `PRESENTED`, `ACCEPTED`) with block numbers and transaction hashes — your institution's immutable audit trail.

---

## 7. Role 2 — Student / Holder

Open **`http://localhost:3000/student`**

### 7.1 Unlock your vault

1. Connect the wallet that holds your credentials (**Account 1** locally). The vault is bound to your address — nobody else can ever see it.
2. Complete the simulated identity binding: any email + OTP **`123456`** (see [section 3](#3-how-accounts--sign-in-work)).
3. Your **My Vault** page loads all Soulbound Tokens owned by your wallet, rendered as certificate cards.

### 7.2 View your credentials

Each card shows the issuer, your name, program, document type, and issue date. Migration certificates additionally show their live status: **Issued → Presented → Accepted**.

### 7.3 Share a credential (the centerpiece feature)

Click **Generate Proof Link** on any credential:

1. *(Optional)* Paste a **verifier's wallet address** to bind the grant to exactly one party. Leave blank to create a "bearer" link anyone holding it can open.
2. Set the **expiry in hours** (e.g., `24` for a day, `720` for a month).
3. Click **Sign & Generate Link** and approve the **EIP-712 signature** in your wallet — this is you cryptographically granting permission.

You receive:

- **A QR code** — the recipient scans or screenshots it.
- **A shareable link** — click **Copy Link** to send via email/chat.
- **The raw signed JSON payload** — copy-pasteable for manual verification.

The link encodes your credential + your signed grant. When someone opens it, the engine checks the signature, expiry, and revocation status before showing anything.

### 7.4 See who viewed your credential

Scroll to **Verification Access Logs**. Every time someone opens your shared link, you see the date, time, which credential, and who opened it. Total transparency — something the paper system never gave you.

### 7.5 Revoke access instantly

Click **Revoke Access Link** under any active QR code. The grant dies immediately — scanning the same QR afterwards fails with **ACCESS DENIED**. Shared links also expire automatically after the duration you chose.

### 7.6 Present a migration certificate

If you hold a migration certificate still in `Issued` status:

1. Click **Present to University**.
2. Enter the destination university's wallet address.
3. Sign the transaction — the on-chain status flips to `Presented`, notifying the destination institution.

The destination university completes the handshake from the Verify page (next section).

### 7.7 Print a receipt

**Print Receipt** renders a clean, printable PDF-style receipt of any credential for offline use.

---

## 8. Role 3 — Verifier / Employer

Open **`http://localhost:3000/verify`** — no wallet, no login, nothing to install.

### 8.1 Submit a credential — three ways

| Method | How |
|---|---|
| **Open a shared link** | Just click the link the student sent you. The payload auto-fills and verifies instantly. |
| **Scan/upload a QR** | Click **Upload QR Image** and select a screenshot/photo of the QR code. It decodes client-side in your browser. |
| **Paste JSON manually** | Copy the credential JSON into the text box and click **Run Verification**. |

No payload handy? Click **Load Demo Asset** to try verification on a built-in example.

### 8.2 Read the verdict

Within ~5 seconds you get a full result card:

- **Credential card** with status: `VALID`, `TAMPERED`, or `REVOKED`.
- **Consensus Checklist** — each proof shown individually:
  - *Cryptographic hash verification* — does the document byte-for-byte match what was anchored on-chain?
  - *Issuer identity registry* — was it minted by a recognized institution?
  - *Revocation status* — live on-chain flag check.
  - *EIP-712 attestation signature* — is the issuer's off-chain signature valid?
- **AI Risk Score** — a 0–100 fraud-anomaly score with plain-English reasons (see [section 10](#10-the-ai-risk-engine)).
- **Download Official Receipt** — print/export a verification receipt for your records.

### 8.3 Accept a migration certificate (universities only)

If the credential being verified is a migration certificate in `Presented` status and you connect an institutional wallet, an **Accept Migration** action appears. One signature records the acceptance on-chain — completing the `issued → presented → accepted` handshake that normally takes weeks of paperwork.

---

## 9. Understanding verification results

| Result | Meaning |
|---|---|
| **VALID** (green) | Hash matches the chain, issuer is registered, credential is not revoked, grant (if any) is valid |
| **TAMPERED** (red) | The presented data differs by even one character from the on-chain hash — forgery detected |
| **REVOKED** (amber) | The issuer explicitly invalidated this credential |
| **EXPIRED** (gray) | The student's time-limited access grant has passed its expiry |
| **DENIED** (gray) | Grant revoked by the student, bad grant signature, or you are not the designated verifier |

> [!NOTE]
> Verification reads the blockchain through a read-only RPC. Even if the VeriCred website were offline, anyone could independently confirm a credential against the chain — the website is an interface, not the source of truth.

---

## 10. The AI risk engine

Every verification includes a fraud-anomaly score. The core trust path stays deterministic (a hash match is a hash match); the AI layer watches for *patterns* across the registry:

- **Mass issuance anomaly** — thousands of credentials minted by one issuer in under an hour
- **Template entropy** — many credentials sharing identical metadata
- **Synthetic issuer** — a brand-new issuer that mints a burst and vanishes
- **Duplicate hash** — the same credential hash reused with different names

By default a fast deterministic rule engine produces the score (no keys needed). With `GEMINI_API_KEY` or `OPENAI_API_KEY` configured, `/api/oracle/risk` consults a real LLM and returns a **signed risk attestation**.

See it live — simulate a diploma mill:

```bash
cd contracts
npm run simulate-diploma-mill     # drives the risk score to ~92/100
```

---

## 11. Feature map — what to use for what

| I want to… | Go to | Do this |
|---|---|---|
| Issue a degree/transcript/migration cert | `/issuer` | Fill form → Sign & Mint |
| Digitize old paper documents | `/issuer` | Upload image in the OCR drop zone before filling |
| Cancel a mistaken/fraudulent credential | `/issuer` | Revoke button in the issued table |
| See my academic records | `/student` | Connect wallet + OTP `123456` |
| Share a credential securely | `/student` | Generate Proof Link → set expiry → sign |
| Limit a share to one specific employer | `/student` | Enter their wallet address in the grant form |
| Stop sharing instantly | `/student` | Revoke Access Link |
| Know who opened my credential | `/student` | Check Verification Access Logs |
| Send a migration cert to my new university | `/student` | Present to University |
| Get a printable record | `/student` or `/verify` | Print Receipt / Download Receipt |
| Check a candidate's credential | `/verify` | Open link / scan QR / paste JSON |
| Accept an incoming migration cert | `/verify` | Connect issuer wallet → Accept Migration |
| Test fraud detection | terminal | `npm run simulate-diploma-mill` |

---

## 12. Troubleshooting & FAQ

**"Access Denied" on the Issuer page**
Your connected wallet doesn't hold `ISSUER_ROLE`. Connect the registered institutional wallet (locally: Hardhat Account 0, which the deploy script registers).

**My vault is empty**
Make sure (a) you're on the right network (chain ID `31337` locally), and (b) credentials were actually minted to *this* address — run `npm run seed` in `contracts/` if you haven't.

**QR scan says ACCESS DENIED**
That's a feature, not a bug. Either the student revoked the link, it expired, or the grant is bound to a different verifier wallet. Ask the student for a fresh link.

**Verification fails with TAMPERED**
Someone modified the credential data after issuance — even one changed character breaks the hash. Request the original link from the student.

**MetaMask shows the wrong network**
Add/select the Localhost 8545 network (chain ID `31337`) per [section 5](#5-connecting-your-demo-wallets).

**Is my data stored anywhere?**
Credentials live on-chain (hash + pointer) and in IPFS/local storage (payload). Supabase is optional. Nothing requires you to trust VeriCred's servers.

**Is the OTP flow real?**
It's an explicitly labeled simulation (`123456`). Real Aadhaar e-KYC requires government partnership and is roadmap work — we don't pretend otherwise.

---

## Further documentation

- [`docs/SOLUTION-BRIEF.md`](./docs/SOLUTION-BRIEF.md) — full solution brief, judging-criteria mapping, staged roadmap
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — ASCII architecture and flow diagrams
- [`docs/ARCHITECTURE-MERMAID.md`](./docs/ARCHITECTURE-MERMAID.md) — Mermaid.js diagrams
- [`docs/COMPREHENSIVE-UI-DESIGN.md`](./docs/COMPREHENSIVE-UI-DESIGN.md) — design system and UI direction
