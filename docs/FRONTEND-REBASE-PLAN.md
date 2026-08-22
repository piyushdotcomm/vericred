# VeriCred — Frontend Rebase: Detailed Implementation Plan

> **Purpose:** This is the master execution plan for rebuilding the VeriCred frontend from the current dark-mode hackathon prototype into a production-quality, light-mode, trust-first educational Web3 platform. No backend changes. All existing API routes, lib functions, contract-client, and smart contract logic remain untouched.
>
> **Design References:**
> - [COMPREHENSIVE-UI-DESIGN.md](./COMPREHENSIVE-UI-DESIGN.md) — UI flow and component specs
> - [design (1).md](./design%20(1).md) — Visual tokens, typography, color palette, motion inventory
> - [SOLUTION-BRIEF.md](./SOLUTION-BRIEF.md) — Business logic, 3-role flows, Trinity of Trust
> - [arch.md](./arch.md) — System architecture diagram

---

## Guiding Principles

| Principle | Application |
|-----------|-------------|
| **Frontend-only** | Zero changes to `lib/`, `app/api/`, `contracts/`, `supabase/`. All existing function signatures, types, and API routes are consumed as-is. |
| **Light mode first** | Current dark theme (`#000000` bg, `#FFFFFF` ink) is inverted to warm off-white (`#FAFAFA` bg, `#1A1A1A` ink). Remove `dark` class from html. |
| **Trust-first aesthetic** | Editorial serif display + Swiss sans body + mono data. Generous whitespace. One accent color (`#C73E1D`). No crypto-bro dark neon. |
| **Impeccable spacing** | Strict 8px grid. `py-24` minimum between major sections. `max-w-7xl` content containers. |
| **Emil Kowalski motion** | All animations under 300ms. `ease-out` for interactions. Spring physics for modals. `prefers-reduced-motion` respected everywhere. No `transition: all`. No `ease-in`. |
| **Existing deps only** | Use what is already installed: `motion` (Framer Motion), `lucide-react`, `tailwindcss`, `geist`, `qrcode.react`. Add only `Playfair Display` (Google Font, free Reckless Neue alternative). |

---

## Current State Inventory (What Exists)

### Files We WILL Modify (Frontend Only)

| File | Current State | Planned Change |
|------|--------------|----------------|
| `app/layout.tsx` | Dark mode, Geist + IBM Plex Mono | Add Playfair Display, remove `dark` class |
| `app/globals.css` | Minimal base styles | Full design token system, easing curves, scroll reveal utilities |
| `tailwind.config.js` | Dark palette tokens | Light palette tokens per design.md |
| `app/page.tsx` | Dark hero + bento grid | Full homepage redesign (9 sections) |
| `app/issuer/page.tsx` | Single-page form + tables | Sidebar dashboard layout |
| `app/student/page.tsx` | Single-page vault | Card-based vault with sharing flows |
| `app/verify/page.tsx` | Single-page verifier | Focused verification portal |
| `components/credential-card.tsx` | Basic card | Premium credential card with seal + badges |
| `components/risk-badge.tsx` | Basic badge | Gradient risk bar + score display |
| `components/seal.tsx` | Basic seal | Animated verification seal |
| `components/wallet-connect.tsx` | Basic button | Styled connect modal |

### Files We WILL Create (New Components)

| File | Purpose |
|------|---------|
| `components/home/announcement-bar.tsx` | Dismissible top banner |
| `components/home/navbar.tsx` | Fixed glassmorphic navigation |
| `components/home/hero.tsx` | Hero section with network visualization |
| `components/home/how-it-works.tsx` | Trinity of Trust explainer |
| `components/home/key-attributes.tsx` | Feature highlights (3-column) |
| `components/home/roles-cta.tsx` | Role-specific CTA section |
| `components/home/about-section.tsx` | About VeriCred + how the platform works |
| `components/home/dashboard-explainer.tsx` | Individual dashboard explanations |
| `components/home/footer.tsx` | Full footer with fiber line |
| `components/ui/button.tsx` | Primary, Secondary, Ghost variants |
| `components/ui/pill-badge.tsx` | Small pill tag component |
| `components/ui/sliding-arrow.tsx` | Animated arrow for CTAs |
| `components/ui/fiber-line.tsx` | Decorative animated divider |
| `components/ui/sidebar.tsx` | Reusable sidebar navigation |
| `components/ui/metric-card.tsx` | Dashboard KPI summary card |
| `components/ui/status-badge.tsx` | VALID/TAMPERED/REVOKED/ACTIVE badges |
| `components/ui/data-table.tsx` | Stripe-style data table |
| `components/ui/empty-state.tsx` | Beautiful empty state component |
| `components/ui/modal.tsx` | Centered modal with spring animation |
| `components/ui/toast.tsx` | Transient notification component |
| `app/issuer/layout.tsx` | Issuer dashboard sidebar layout |
| `app/student/layout.tsx` | Student vault layout |

### Files We Will NOT Touch

```
lib/*                    -- All pure logic (hash, verify, ai-risk, contract-client, types, db, etc.)
app/api/*                -- All API routes (credentials, access-logs, auth, kyc, oracle, upload, etc.)
contracts/*              -- Smart contract code
supabase/*               -- Database schema
data/*                   -- Seed data
scripts/*                -- Build/deploy scripts
```

---

## Phase 0: Foundation -- Design System and Tokens
**Estimated scope:** ~15 files. No visual output yet. Pure infrastructure.

### 0.1 Update `tailwind.config.js`
- Replace the entire dark color palette with the light palette from `design (1).md`:
  - `background: "#FAFAFA"`, `surface: "#FFFFFF"`, `surfaceAlt: "#F5F5F0"`
  - `ink: "#1A1A1A"`, `inkSecondary: "#555555"`, `inkMuted: "#888888"`
  - `border: "#E5E5E5"`, `borderStrong: "#CCCCCC"`
  - `accent: "#C73E1D"`, `accentHover: "#A83218"`, `accentBg: "#C73E1D1A"`
  - `valid: "#16A34A"`, `validBg: "#16A34A1A"`
  - `tampered: "#DC2626"`, `tamperedBg: "#DC26261A"`
  - `revoked: "#D97706"`, `revokedBg: "#D977061A"`
  - Hero gradients: `heroGradient1: "#2E3192"`, `heroGradient2: "#7B61FF"`
- Add border-radius tokens: `sharp: "0px"`, `sm: "4px"`, `pill: "999px"`, `modal: "8px"`
- Add font-family: `serif: ["var(--font-playfair)", "Georgia", "serif"]`
- Add easing curves via CSS custom properties (in globals.css)

### 0.2 Update `app/globals.css`
- Add CSS custom properties for easing curves:
  - `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
  - `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);`
  - `--ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);`
- Update base body styles for light mode
- Add utility classes for text styles (`.eyebrow`, `.body-sm`)
- Keep existing `prefers-reduced-motion` styles
- Update `::selection` for light mode

### 0.3 Update `app/layout.tsx`
- Add `Playfair_Display` via `next/font/google` (free alternative to Reckless Neue for editorial serif headings)
- Remove `dark` class from html
- Keep existing `GeistSans` and `IBM_Plex_Mono`
- Add the serif CSS variable `--font-playfair`
- Remove metadata export (will add it back in Phase 1 with proper SEO)

### 0.4 Build Shared UI Components (`components/ui/`)
Build these atomic components FIRST. Every subsequent phase depends on them.

#### `button.tsx`
- Three variants: `primary` (accent bg, white text, 4px radius), `secondary` (outlined, pill radius), `ghost` (transparent, pill, thin border)
- Sliding arrow animation on primary hover
- Press feedback: `scale(0.97)` on `:active`
- `disabled` state styling
- IBM Plex Mono font for button labels

#### `pill-badge.tsx`
- Small tag: mono font, 12px, border, pill radius
- Color variants: `default`, `valid`, `tampered`, `revoked`

#### `status-badge.tsx`
- Larger status indicators for VALID / TAMPERED / REVOKED / ACTIVE / EXPIRED / DENIED
- Color-coded backgrounds with matching text
- Mono font, uppercase, tracking-widest

#### `metric-card.tsx`
- Dashboard KPI card: label (eyebrow), value (large number), optional trend indicator
- Clean border, no heavy shadows

#### `data-table.tsx`
- Stripe-inspired table: no vertical borders, subtle horizontal dividers
- Column headers in mono uppercase
- Row hover state
- Optional action column

#### `empty-state.tsx`
- Centered icon + heading + description + optional CTA
- Used when dashboards have no data

#### `modal.tsx`
- Centered overlay with `backdrop-blur`
- Spring animation (origin from trigger button per Emil Kowalski)
- Close on backdrop click + Escape key
- Focus trap for accessibility

#### `toast.tsx`
- Transient notification (success/error/info)
- Slides in from top-right
- Auto-dismiss after 5s
- Uses `status-badge` colors

#### `sidebar.tsx`
- Persistent left sidebar for dashboards
- Logo + nav links + bottom actions
- Collapsible on mobile (hamburger)
- Active state highlighting
- Width: 260px desktop

#### `fiber-line.tsx`
- Decorative animated horizontal rule
- 1px line with a glowing pulse that travels left to right
- CSS-only (pseudo-element with translating gradient)

#### `sliding-arrow.tsx`
- Arrow icon that slides right on hover
- Used inside primary CTA buttons

**Done criteria for Phase 0:** All tokens compile. All UI components render in isolation. No visual regressions on existing pages (they will look broken with new colors -- that is expected and fixed in Phase 1+).

---

## Phase 1: Homepage Redesign
**Estimated scope:** ~10 files. The public face of VeriCred.

### 1.1 Navigation Bar (`components/home/navbar.tsx`)
- Fixed, `top-0`, `z-50`, height 64px
- Background: `bg-background/80` with `backdrop-blur-md`
- Bottom border: `1px solid border`
- Left: Brand mark (dot + "VeriCred" in Geist Sans, uppercase, 14px, tracking-wide)
- Center: Nav links ("How It Works", "Features", "For Issuers", "Docs") -- Geist Sans, 14px, `ink-muted`, hover to `ink`
- Right: "Contact" ghost button + "Verify Now" primary CTA
- Mobile: Hamburger menu (Lucide icon)

### 1.2 Announcement Bar (`components/home/announcement-bar.tsx`)
- Above navbar, below header
- Dark bg (`ink`), white text, mono font 14px
- Dismissible (X button, saved to `localStorage`)
- Content: "VeriCred is live on Polygon Amoy Testnet"
- Animate out: slide up + height collapse (300ms, `ease-out`)

### 1.3 Hero Section (`components/home/hero.tsx`)
- Full viewport height (`min-h-[100dvh]` minus header)
- Centered layout, text stacked vertically
- **Headline:** Playfair Display Italic, `clamp(2.5rem, 5vw, 4.5rem)`, `ink`, centered, `text-wrap: balance`
  - Copy: "Trust Is Earned. Credentials Should Prove It."
- **Subtext:** Geist Sans, 16-18px, `ink-secondary`, max-width `50ch`
  - Copy: "Academic credentials secured on-chain. Immutable, instantly verifiable, and mathematically impossible to forge."
- **CTAs:** Primary "Verify Now" + Secondary outlined "Issuer Console"
- **Background:** Abstract network visualization (SVG-based, blue-violet gradient pixels with thin connecting lines). Built as a React component. Fades into white background at edges.
- **Animations:** Staggered fade-up on load (headline then subtext then CTAs, 100ms delay each)

### 1.4 About Section (`components/home/about-section.tsx`)
- **NEW section not in original design.md -- requested by user**
- Full-width section below hero
- Split layout: Left 6-col text, Right 6-col illustration/diagram
- **Heading:** "What is VeriCred?" (Playfair Display)
- **Body:** Explains the Trinity of Trust in plain language
  - "The blockchain proves a credential is real. The AI proves it is not fake. The student's grant proves it is consented."
- **Diagram:** Visual showing the Issue then Hold then Grant then Verify flow
- Background: `surface-alt` for section differentiation

### 1.5 How It Works Section (`components/home/how-it-works.tsx`)
- Step-by-step flow explanation with numbered steps
- 5 steps: Issue, Hold, Grant, Verify, AI Risk Screen
- Each step: Number badge + heading + short description + icon
- Layout: Horizontal steps on desktop (with connecting lines), vertical stack on mobile
- Uses Lucide icons for each step
- Subtle scroll-reveal animation (fade-up, staggered 60ms)

### 1.6 Key Attributes / Features Section (`components/home/key-attributes.tsx`)
- Centered heading: Playfair Display Italic -- "Key Attributes"
- 3-column grid, each card: checkmark icon + 2-line label
  - "Immutable on-chain records"
  - "Verifiable in seconds"
  - "Zero-Knowledge proofs"
- Minimal cards: no bg, no border, no elevation -- just icon + text
- Vertical hairline dividers between cards
- CTA pair below: Primary + Secondary

### 1.7 Dashboard Explainer Section (`components/home/dashboard-explainer.tsx`)
- **NEW section -- requested by user**
- Explains how each of the 3 dashboards works individually
- Layout: 3-column cards on desktop, stacked on mobile
- Each card represents a role:

**Issuer (Universities) Card:**
- Icon: Buildings (Lucide)
- Title: "Issuer Console"
- Description: "Universities issue tamper-proof credentials. Upload documents, hash them on-chain, and deliver digital keys to students in seconds."
- Key features list: Issue certificates, Revoke credentials, AI OCR auto-fill, Activity audit log
- CTA: "Open Issuer Console"

**Student (Holder) Card:**
- Icon: GraduationCap (Lucide)
- Title: "Student Vault"
- Description: "Your credentials, your control. View all issued documents, share via QR with expiring grants, and track who accessed what."
- Key features list: Credential wallet, QR sharing, Revocable access grants, Access log transparency
- CTA: "Open Vault"

**Verifier (Organizations) Card:**
- Icon: ShieldCheck (Lucide)
- Title: "Verifier Portal"
- Description: "Verify any credential in under 5 seconds. No wallet needed, no login required. Paste JSON or scan a QR code."
- Key features list: Wallet-free verification, AI fraud detection, Hash + signature check, Instant results
- CTA: "Verify Now"

### 1.8 Roles CTA Section (`components/home/roles-cta.tsx`)
- Full-width CTA for institutions
- Pill badge: "Universities and Issuers"
- Large heading: "Start Issuing Verified Credentials Today"
- Body text + Primary CTA + Secondary CTA
- Social proof: "Trusted by 50+ institutions" (placeholder)

### 1.9 Footer (`components/home/footer.tsx`)
- Large display "VeriCred" logo spanning full width
- Fiber line animation (CSS-only pulse)
- 4 columns: Explore, Company, Legal, Social
- Eyebrow labels: IBM Plex Mono, 11px, uppercase
- Links: Geist Sans, 14px, `ink-muted`, hover underline slide-in
- Copyright: bottom, mono, 12px

### 1.10 Assemble Homepage (`app/page.tsx`)
- Import and compose all sections in order:
  1. AnnouncementBar
  2. Navbar
  3. Hero
  4. About
  5. HowItWorks
  6. KeyAttributes
  7. DashboardExplainer
  8. RolesCTA
  9. Footer
- Add proper Metadata for SEO (title, description, OG tags)
- Ensure proper semantic HTML (header, main, section, footer)

**Done criteria for Phase 1:** Homepage loads with all 9 sections. All animations work. Fully responsive (mobile to desktop). Lighthouse accessibility score >= 90.

---

## Phase 2: Issuer Dashboard Redesign
**Estimated scope:** ~5 files. The institutional power-user view.

### 2.1 Issuer Layout (`app/issuer/layout.tsx`)
- Sidebar layout using `components/ui/sidebar.tsx`
- Sidebar links:
  - **Dashboard** (home icon) -- overview + metrics
  - **Issue Credential** (plus icon) -- issuance form
  - **Issued Registry** (list icon) -- all issued credentials table
  - **Activity Log** (clock icon) -- blockchain event feed
- Header bar: page title + wallet connect button (right-aligned)
- Main content area: scrollable, max-width constrained

### 2.2 Issuer Dashboard View (refactor `app/issuer/page.tsx`)
The existing page.tsx has ALL functionality in one file. We split into clear views while keeping the same backend calls.

**Top Metric Strip:**
- 3 `metric-card` components side by side:
  - "Total Issued" -- `issued.length`
  - "Active Credentials" -- `issued.filter(r => !r.revoked).length`
  - "Revoked" -- `issued.filter(r => r.revoked).length`

**Issuance Form (main content area):**
- Keep all existing state management and `issue()` function
- Restyle the form inputs:
  - Label ABOVE input (Geist Sans, uppercase eyebrow)
  - Input: full-width, `border border-border`, 16px padding, focus ring in accent
  - No placeholder-as-label
- OCR Upload zone: dashed border, drag-and-drop styled
- Document type selector: styled select or segmented control (Degree / Transcript / Migration)
- Submit button: Full-width primary CTA "Sign and Mint Credential"
- Status toast: success/error feedback via `toast.tsx`

**Issued Credentials Table:**
- Use `data-table.tsx` component
- Columns: Student Name, Program, Doc Type, Token ID, Status (Active/Revoked badge), Actions
- Row actions: "Revoke" button (ghost style, hover turns tampered-red)
- Empty state when no credentials issued

**Activity Log:**
- Timeline-style feed (not a table)
- Each entry: type badge (ISSUED/REVOKED/PRESENTED/ACCEPTED), description, block number, tx hash (truncated, mono)
- Color-coded by type

### 2.3 Issuer Flow (End-to-End)
1. Issuer opens `/issuer` -- sees Dashboard with metrics
2. Clicks "Issue Credential" in sidebar -- sees clean form
3. (Optional) Uploads legacy document -- AI OCR auto-fills fields
4. Fills student name, wallet address, course, document type
5. Clicks "Sign and Mint" -- SIWE sign-in -- wallet confirmation modal
6. On success: toast notification "Credential issued! Tx: 0x..." + auto-refresh table
7. Can view all issued credentials in the registry table
8. Can revoke any active credential with confirmation modal
9. Activity log shows real-time blockchain events

**Backend functions consumed (NO CHANGES):**
- `checkIsIssuer()`, `issueCredentialOnChain()`, `revokeCredentialOnChain()`, `signIssuerAttestation()`, `getTokenIdByHash()`, `credentialHashBytes32()`
- `fetch("/api/credentials")` -- GET + POST
- `fetch("/api/upload")` -- POST
- `getPublicClient().readContract()` -- getCredential
- `getPublicClient().getLogs()` -- event logs

---

## Phase 3: Student Vault Redesign
**Estimated scope:** ~5 files. The consumer-friendly credential wallet.

### 3.1 Student Layout (`app/student/layout.tsx`)
- Minimal top-nav layout (not sidebar -- this is a consumer app, not admin)
- Top bar: "Back to VeriCred" link + "My Vault" title + Wallet Connect
- Content: centered, max-width `max-w-5xl`

### 3.2 Student Vault View (refactor `app/student/page.tsx`)
Keep all existing state management, OTP verification, grant signing, and sharing logic.

**OTP Gate (Identity Binding):**
- Clean centered card
- "Verify Your Identity" heading
- 6-digit OTP input (styled as individual boxes)
- "Verify" primary CTA
- Note: "This simulates Aadhaar OTP verification"

**Credential Cards Grid:**
- Replace current list with visual card grid
- Each credential rendered as a `credential-card.tsx` (redesigned):
  - Aspect ratio 3:4 card
  - Header: Issuer name + university monogram
  - Body: Student name (serif, large), Course (mono), Doc type badge
  - Footer: Issue date, Token ID, Status badge (Active/Revoked)
  - QR code placeholder area
  - Migration status indicator (for migration certificates)
- Grid: 2 columns on desktop, 1 column on mobile

**Share Flow (per credential):**
- Click "Share" on a credential card -- opens a modal
- Modal contents:
  1. **Verifier address input** (optional -- leave blank for "bearer" link)
  2. **Expiry selector**: 24h / 7 days / 30 days / 90 days (segmented control)
  3. **"Generate Proof Link" primary CTA** -- triggers EIP-712 grant signing
  4. **Result:** QR code (using `qrcode.react`) + copyable share URL
  5. **Revoke button** below QR: "Revoke this access link"
- Clear explanation: "You are granting [duration] read access to [verifier/anyone]"

**Present Migration Flow:**
- For migration certificates: "Present to University" button
- Opens modal: destination university wallet address input
- Triggers `presentMigrationOnChain()`

**Access Log:**
- Timeline view showing who accessed which credential and when
- Each entry: verifier address (truncated), credential name, timestamp
- Uses `fetch("/api/access-logs")` data

### 3.3 Student Flow (End-to-End)
1. Student opens `/student` -- OTP gate (simulated identity binding)
2. Enters 6-digit OTP -- verified -- vault opens
3. Sees all credentials as visual cards
4. Clicks a credential -- expands to show details
5. Clicks "Share" -- modal with verifier address + expiry selection
6. Signs EIP-712 grant via MetaMask -- QR code generated
7. Can copy the share link or show the QR
8. Access log shows real-time tracking
9. Can revoke any active share link instantly

**Backend functions consumed (NO CHANGES):**
- `tokensOfOwner()`, `getCredentialOnChain()`, `signGrant()`, `presentMigrationOnChain()`
- `fetch("/api/credentials")` -- GET
- `fetch("/api/access-logs")` -- GET + POST
- `fetch("/api/revoke-grant")` -- POST

---

## Phase 4: Verifier Portal Redesign
**Estimated scope:** ~3 files. The zero-friction truth engine.

### 4.1 Verifier Layout
- No sidebar, no complex nav -- this is a single-task focused view
- Top bar: VeriCred logo + "Verify a Credential" title + Wallet Connect (optional, for migration acceptance)
- Centered content, `max-w-2xl`

### 4.2 Verifier Portal View (refactor `app/verify/page.tsx`)
Keep all existing verification logic, risk scoring, and migration acceptance.

**Input Zone (initial state):**
- Large, prominent textarea: "Paste credential JSON here"
- OR: "Scan QR Code" button (opens camera on mobile)
- OR: Auto-fill from URL params (existing `?grant=` flow)
- Primary CTA: "Verify Credential"
- Clean, minimal -- Google Search-style simplicity

**Verification in Progress:**
- Skeleton loader matching the result card shape
- Text: "Verifying against blockchain..."

**Result Card (The Verdict):**
- Full-width card with prominent status:

  **VALID (Green):**
  - Large animated checkmark (spring animation)
  - "Credential Verified" heading
  - Details: Issuer DID, Student Name, Course, Issue Date
  - Hash match confirmation (mono, truncated)
  - Grant validity: "Access granted until [date]"
  - Risk score section: AI fraud analysis bar (0-100 gradient)

  **TAMPERED (Red):**
  - Shake animation on entry
  - "Hash Mismatch -- Credential Tampered" heading
  - Shows expected vs actual hash

  **REVOKED (Amber):**
  - Warning icon
  - "Credential Revoked by Issuer" heading
  - Revocation details

  **DENIED (Gray):**
  - Lock icon
  - "Access Denied -- Grant expired or revoked"

**AI Risk Score Display:**
- Horizontal gradient bar (green to yellow to red)
- Score number prominently displayed
- Risk reasons listed below (from `RiskReport.reasons[]`)
- "The AI verdict is deterministic and verifiable" footnote

**Migration Acceptance (for connected university wallets):**
- If connected wallet is an issuer AND credential is a migration cert:
- Show "Accept Migration" primary CTA
- Triggers `acceptMigrationOnChain()`
- Success: "Migration accepted! This credential is now recognized by your institution."

### 4.3 Verifier Flow (End-to-End)
1. Verifier opens `/verify` -- sees clean input zone
2. Pastes JSON or scans QR -- clicks "Verify"
3. Loading state (skeleton) -- Result card appears
4. VALID: Green checkmark + details + AI risk score
5. TAMPERED: Red shake + hash mismatch details
6. (Optional) Connects wallet -- can accept migration certificates
7. No login, no wallet required for basic verification

**Backend functions consumed (NO CHANGES):**
- `verifyOnChain()`, `verifyGrantSignature()`, `verifyIssuerAttestation()`, `acceptMigrationOnChain()`
- `getTokenIdByHash()`, `fetchRegistryStats()`, `getCredentialOnChain()`
- `scoreRisk()`, `credentialHashBytes32()`

---

## Phase 5: Polish, Animation and QA
**Estimated scope:** All files. The final 20% that makes it feel premium.

### 5.1 Animation Pass
Apply motion consistently across all pages:

**Page Load Animations:**
- Hero: staggered fade-up (headline then subtext then CTAs then background viz)
- Dashboard metrics: counter animation (numbers count up from 0)

**Scroll Reveals:**
- All homepage sections: fade-up from `translateY(24px)`, 600ms, `ease-reveal`, trigger `whileInView` once
- Feature cards: staggered fade-up, 60ms between items

**Interaction Feedback:**
- All buttons: `scale(0.97)` on active, 160ms
- All CTA arrows: slide right on hover
- Table rows: subtle bg tint on hover
- Cards: `-translate-y-[2px]` on hover

**Status Animations:**
- Valid checkmark: spring animation (scale from 0.9 to 1)
- Tampered result: shake animation (translateX plus/minus 4px)
- Toast: slide in from right, fade out

### 5.2 Responsive Audit
Test every page at these breakpoints:
- **Mobile (375px):** Single column, hamburger nav, stacked cards
- **Tablet (768px):** 2-column grids, condensed nav
- **Desktop (1280px):** Full layout, all columns visible

### 5.3 Accessibility Audit
- Color contrast: verify all text passes WCAG AA (4.5:1 body, 3:1 large text)
- Focus states: `2px solid accent, 2px offset` on all interactive elements
- Keyboard nav: tab order matches visual order
- Screen readers: proper `aria-label` on icon-only buttons
- Semantic HTML: header, nav, main, section, footer
- Skip-to-content link

### 5.4 SEO and Metadata
- Proper title tags per page
- Meta descriptions
- OG image (generate one via the network visualization)
- Proper heading hierarchy (single h1 per page)

### 5.5 Build Verification
- `npm run build` -- must pass with zero errors
- `npm run test` -- existing tests must still pass (we did not touch lib/)
- Lighthouse: Performance >= 80, Accessibility >= 90, SEO >= 90

---

## Execution Order Summary

| Phase | What Ships | Key Risk |
|-------|-----------|----------|
| **0** | Design tokens, shared UI components | Breaking existing pages during color swap (expected, temporary) |
| **1** | Complete homepage (9 sections) | Hero network visualization complexity -- simplify if needed |
| **2** | Issuer dashboard (sidebar + form + table + activity) | Preserving all existing issue/revoke logic during restructure |
| **3** | Student vault (cards + sharing + access log) | Preserving EIP-712 grant signing flow during modal redesign |
| **4** | Verifier portal (input + result card + AI risk) | Preserving wallet-free verification flow |
| **5** | Animation, responsiveness, accessibility, build check | Time -- this phase is always underestimated |

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking backend | We never modify files in `lib/`, `app/api/`, `contracts/`. All imports stay the same. |
| Font licensing | Use Playfair Display (Google Fonts, free) instead of Reckless Neue (paid). |
| Performance (animations) | Use `transform` + `opacity` only. Animate via Motion `useMotionValue`, never `useState` for continuous values. |
| Mobile wallet UX | Keep RainbowKit (already installed) -- it handles mobile wallet detection automatically. |
| Build failures | Run `npm run build` after each phase before proceeding. |

---

> **This plan modifies ONLY the presentation layer. Every API call, every contract interaction, every hash computation, every database query remains exactly as it is today. We are re-skinning, not re-building.**
