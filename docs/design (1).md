# VeriCred — Visual Theme & Design Tokens

> **NOTE:** For the complete dashboard structures, UX flows, and UI principles, please see the master blueprint: [COMPREHENSIVE-UI-DESIGN.md](./COMPREHENSIVE-UI-DESIGN.md). This document focuses solely on the visual styling elements.

> Inspired by [DoubleZero Web3 Website Design](https://dribbble.com/shots/27639120-Web3-Website-Design-DoubleZero)
> Adapted for VeriCred — Instant Transcript & Migration Verification System

---

## Design Read

**Reading this as:** Web3 credential verification landing page for institutional buyers (universities, embassies, employers) and students, with an editorial-serif + Swiss-mono language, leaning toward light-mode trust-first aesthetics with restrained motion and high typographic contrast.

### Design Dials (per design-taste-frontend)

| Dial              | Value | Rationale                                                        |
| ----------------- | ----- | ---------------------------------------------------------------- |
| `DESIGN_VARIANCE` | 7     | Editorial serif display + Swiss sans body = high visual contrast |
| `MOTION_INTENSITY`| 5     | Purposeful reveals, no cinematic excess — trust-first product    |
| `VISUAL_DENSITY`  | 4     | Airy, generous whitespace; content breathes                      |

---

## 1. Color Palette

### 1.1 Reference Extraction (from DoubleZero)

The DoubleZero design uses a warm off-white background with deep near-black text, a coral/red primary accent for CTAs, and muted blue-violet gradients in the hero illustration. The palette is intentionally restrained — monochromatic base with one strong accent.

### 1.2 VeriCred Adapted Palette

> **IMPORTANT:** The palette shifts from VeriCred's current dark-mode identity to a light editorial mode inspired by DoubleZero. This is a deliberate inversion — the trust-first, institutional audience responds better to light, clean surfaces than dark tech aesthetics.

| Token                  | Hex         | OKLCH (approx)                    | Usage                                       |
| ---------------------- | ----------- | --------------------------------- | ------------------------------------------- |
| `--background`         | `#FAFAFA`   | `oklch(0.98 0.002 106)`           | Page background — clean near-white           |
| `--surface`            | `#FFFFFF`   | `oklch(1.0 0 0)`                  | Cards, elevated surfaces                     |
| `--surface-alt`        | `#F5F5F0`   | `oklch(0.965 0.008 100)`          | Subtle section alternation, announcement bar |
| `--ink`                | `#1A1A1A`   | `oklch(0.22 0 0)`                 | Primary text — near-black                    |
| `--ink-secondary`      | `#555555`   | `oklch(0.45 0 0)`                 | Body text, descriptions                      |
| `--ink-muted`          | `#888888`   | `oklch(0.62 0 0)`                 | Captions, metadata, nav items                |
| `--border`             | `#E5E5E5`   | `oklch(0.92 0 0)`                 | Hairline borders, dividers                   |
| `--border-strong`      | `#CCCCCC`   | `oklch(0.84 0 0)`                 | Active borders, button outlines              |
| `--accent`             | `#C73E1D`   | `oklch(0.52 0.18 30)`             | Primary CTA — warm red/coral                 |
| `--accent-hover`       | `#A83218`   | `oklch(0.46 0.16 28)`             | CTA hover state                              |
| `--accent-bg`          | `#C73E1D1A` | —                                 | 10% accent for subtle tinting                |
| `--valid`              | `#16A34A`   | `oklch(0.58 0.16 145)`            | Verified / valid status                      |
| `--valid-bg`           | `#16A34A1A` | —                                 | Valid background tint                        |
| `--tampered`           | `#DC2626`   | `oklch(0.52 0.21 27)`             | Tampered / error status                      |
| `--tampered-bg`        | `#DC26261A` | —                                 | Tampered background tint                     |
| `--revoked`            | `#D97706`   | `oklch(0.60 0.16 75)`             | Revoked / warning status                     |
| `--revoked-bg`         | `#D977061A` | —                                 | Revoked background tint                      |
| `--hero-gradient-1`    | `#2E3192`   | `oklch(0.35 0.18 270)`            | Deep blue — hero pixel art                   |
| `--hero-gradient-2`    | `#7B61FF`   | `oklch(0.55 0.20 290)`            | Mid violet — hero pixel art                  |
| `--hero-gradient-3`    | `#C73E1D33` | —                                 | Warm coral accent in network viz             |

### 1.3 Color Strategy

**Restrained** — tinted neutrals + one saturated accent at 15% or less surface coverage. The red/coral accent is used exclusively for primary CTAs and the announcement bar. Everything else lives in the neutral grayscale.

### 1.4 Dark Mode Consideration

The DoubleZero reference has a dark mode toggle. For V1, ship light-mode only (matching the Dribbble shot). Dark mode can be layered later using CSS custom properties.

---

## 2. Typography

### 2.1 Reference Extraction (from DoubleZero)

DoubleZero uses four font families:
- **Reckless** (serif) — Display headings. This is the defining typographic choice. Large italic serif headings ("Slow Is A Choice. The Fastest Traders Already Made Theirs.") create editorial gravitas.
- **Suisse Intl** (sans-serif) — Navigation, body text, UI elements. Clean Swiss grotesque.
- **Suisse Intl Mono** — Eyebrow labels, data readouts, footer.
- **IBM Plex Mono** — Technical data, code-like elements.

### 2.2 VeriCred Adapted Typography

> **IMPORTANT:** This design uses a serif display font — justified because the reference explicitly calls for editorial-serif display, and the institutional/academic trust context of VeriCred genuinely benefits from the gravitas a serif provides (per design-taste-frontend serif discipline exception).

| Role               | Font Family             | Fallback                             | Weight     | Notes                                     |
| ------------------- | ---------------------- | ------------------------------------ | ---------- | ----------------------------------------- |
| **Display (H1)**    | **Reckless Neue**      | `Georgia, 'Times New Roman', serif`  | 400 (Regular) | Hero headline only. Italic variant for emphasis. |
| **Heading (H2-H3)** | **Reckless Neue**      | `Georgia, 'Times New Roman', serif`  | 400        | Section headlines. Italic for select words.|
| **Body / UI**       | **Geist Sans**         | `system-ui, sans-serif`              | 400, 500   | Already in project. Clean neutral sans.    |
| **Mono / Data**     | **IBM Plex Mono**      | `ui-monospace, monospace`            | 400, 500   | Already in project. Eyebrows, hashes, data.|
| **Nav / UI Labels** | **Geist Sans**         | `system-ui, sans-serif`              | 400        | Navigation items, button labels.           |

### 2.3 Type Scale

| Element            | Size                            | Weight | Tracking       | Leading     | Text-wrap   |
| ------------------ | ------------------------------- | ------ | -------------- | ----------- | ----------- |
| Hero H1 (desktop)  | `clamp(2.5rem, 5vw, 4.5rem)`  | 400    | `-0.02em`      | `1.05`      | `balance`   |
| Hero H1 (mobile)   | `clamp(2rem, 7vw, 3rem)`      | 400    | `-0.02em`      | `1.1`       | `balance`   |
| Section H2          | `clamp(1.75rem, 3vw, 2.5rem)` | 400    | `-0.02em`      | `1.15`      | `balance`   |
| Subsection H3       | `1.25rem`                      | 500    | `-0.01em`      | `1.3`       | —           |
| Body                | `1rem` (16px)                  | 400    | `0`            | `1.6`       | `pretty`    |
| Body small          | `0.875rem` (14px)              | 400    | `0`            | `1.5`       | —           |
| Eyebrow / Label     | `0.75rem` (12px) mono          | 500    | `0.05em`       | `1.3`       | —           |
| Nav item            | `0.875rem` (14px)              | 400    | `0`            | `1`         | —           |
| Button label        | `0.875rem` (14px)              | 500    | `0.02em`       | `1`         | —           |

### 2.4 Typographic Pairing Rationale

The **Reckless + Geist** pairing creates maximum contrast on the serif-vs-grotesque axis:
- Reckless brings editorial authority (academic credentials deserve gravitas)
- Geist provides functional clarity for UI, navigation, and body text
- IBM Plex Mono adds technical legitimacy for blockchain hashes, addresses, and data readouts

This mirrors DoubleZero's approach: serif headings for emotional weight, sans for everything functional.

> **TIP:** Font source for Reckless Neue: Available from [Displaay Type Foundry](https://displaay.net/typeface/reckless-neue/). If licensing is a concern, substitute with **Playfair Display** (Google Fonts) or **EB Garamond** (Google Fonts) for a free alternative with similar editorial character.

---

## 3. Layout Architecture

### 3.1 Global Layout

| Property           | Value                         |
| ------------------ | ----------------------------- |
| Max content width  | `1280px` (`max-w-7xl`)        |
| Page gutter        | `24px` mobile, `32px` tablet, `48px` desktop |
| Section spacing    | `96px-128px` (`py-24` to `py-32`) between major sections |
| Grid system        | CSS Grid — 12-column at `lg:`, 1-column mobile |

### 3.2 Breakpoints

| Name   | Width   | Usage                         |
| ------ | ------- | ----------------------------- |
| `sm`   | 640px   | Small phones to tablets       |
| `md`   | 768px   | Tablet portrait               |
| `lg`   | 1024px  | Tablet landscape to desktop   |
| `xl`   | 1280px  | Desktop                       |
| `2xl`  | 1536px  | Large desktop                 |

### 3.3 Corner Radius Scale (Shape Consistency Lock)

| Element           | Radius     |
| ----------------- | ---------- |
| Buttons (primary) | `4px`      |
| Buttons (outlined)| `999px` (full-pill) |
| Cards             | `0px`      |
| Inputs            | `4px`      |
| Tags/badges       | `999px`    |
| Modals            | `8px`      |

> **NOTE:** DoubleZero uses **sharp corners** on most elements (cards, sections, images) with full-pill radius on some interactive elements. VeriCred adapts this: primary CTA has a small `4px` radius, secondary/outlined buttons use full-pill, cards are sharp-edged (0 radius).

---

## 4. Homepage Components

### 4.1 Component Inventory (Top to Bottom)

```
+-----------------------------------------------------+
|  01. Announcement Bar                                |
+-----------------------------------------------------+
|  02. Navigation Bar (Fixed)                          |
+-----------------------------------------------------+
|  03. Hero Section                                    |
|      +-- Headline (serif italic)                     |
|      +-- Subtext (sans)                              |
|      +-- CTA Pair (primary + outlined)               |
|      +-- Background: Network visualization           |
+-----------------------------------------------------+
|  04. How It Works / Protocol Overview                |
|      +-- Section headline (serif)                    |
|      +-- Body paragraph                              |
|      +-- Architecture diagram / layer stack          |
+-----------------------------------------------------+
|  05. Key Attributes / Features                       |
|      +-- Section headline centered                   |
|      +-- 3-column icon + label cards                 |
|      +-- CTA pair                                    |
+-----------------------------------------------------+
|  06. Validators / Roles CTA Section                  |
|      +-- Role label (pill badge)                     |
|      +-- Large serif headline                        |
|      +-- Body text                                   |
|      +-- Primary CTA + Outlined CTA                  |
|      +-- Social proof stat                           |
+-----------------------------------------------------+
|  07. Footer                                          |
|      +-- Logo (full width)                           |
|      +-- Link columns (Explore, Company, Legal, Social)|
|      +-- Theme toggle                                |
|      +-- Fiber line animation                        |
+-----------------------------------------------------+
```

---

### 4.2 Component Details

#### 01. Announcement Bar

- **Position:** Fixed, below header
- **Background:** `--ink` (near-black) — inverted from page background
- **Text:** `--background` (white), Mono font, 14px, tracking-tight
- **Link:** Underlined, same color
- **Close button:** x icon, right-aligned
- **Height:** ~40px
- **Behavior:** Dismissible (saved to localStorage). Shifts page content down when visible.

#### 02. Navigation Bar

**DoubleZero Reference:**

Logo | Products | Network | Live Data | Resources | [theme toggle] [Contact Us] [Buy Market Data ->]

**VeriCred Adaptation:**

[dot] VeriCred | How It Works | Features | For Issuers | Docs | [Contact] [Verify Now ->]

- **Position:** `fixed top-0 z-50`
- **Height:** 64px
- **Background:** `--background/80` with `backdrop-blur-md` (transparent glass on scroll)
- **Border:** `1px solid --border` bottom border
- **Logo:** Left-aligned. Brand mark (small dot/circle) + "VeriCred" in Geist Sans, tracking-wide, uppercase, 14px
- **Nav Links:** Center-aligned group. Geist Sans 14px, `--ink-muted` color, hover to `--ink`
- **Dropdowns:** Clean overlay panels (not hover-only — click to open per accessibility)
- **Right actions:**
  - "Contact" — ghost button, `--ink` text, `border-radius: 999px`, `border: 1px solid --border`
  - "Verify Now ->" — primary CTA, `--accent` bg, white text, sliding arrow animation, full-height strip flush with right edge (negative margin)

**Nav CTA Pattern (from DoubleZero):**
The rightmost CTA extends to the viewport edge with a dark background, creating a visual "strip" that breaks the nav boundary. This is a distinctive design choice — adapt for "Verify Now ->".

#### 03. Hero Section

**DoubleZero Hero Analysis:**
- Centered layout
- Large serif italic headline: *"Slow Is A Choice. The Fastest Traders Already Made Theirs."*
- Short sans-serif subtext below
- Two CTAs side by side (primary red/coral + outlined)
- Background: A generative pixelated world map visualization with network node connections, blue-violet gradient pixels, thin connecting lines with small squares at intersections

**VeriCred Hero Adaptation:**

- **Layout:** Centered, text stacked vertically
- **Headline:** Reckless Neue Italic, `clamp(2.5rem, 5vw, 4.5rem)`, `--ink`, centered, `text-wrap: balance`
  - Copy: *"Trust Is Earned. Credentials Should Prove It."*
- **Subtext:** Geist Sans, 16-18px, `--ink-secondary`, centered, max-width `50ch`
  - Copy: "Academic credentials secured on-chain. Immutable, instantly verifiable, and mathematically impossible to forge."
- **CTAs:**
  - Primary: "Verify Now ->" — `--accent` bg, white text, `border-radius: 4px`, `px-8 py-4`, sliding arrow icon
  - Secondary: "Issuer Console" — outlined, `border: 1px solid --border-strong`, `--ink` text, `border-radius: 999px`, `px-6 py-3`
- **Background Visualization:** Generative pixelated network/map — blue and coral gradient pixels forming an abstract globe/network. Thin hairline connections between nodes with small square markers at intersections. This replaces the current "terminal logs" box.
- **Min height:** `min-h-[100dvh]` minus header height
- **Hero top padding cap:** `pt-24` max (per impeccable rules)

#### 04. How It Works / Protocol Overview Section

**DoubleZero Reference:** "Introducing the DoubleZero Network" — Left-aligned large serif heading + body paragraph, right side shows an architectural layer diagram (Application to Physical).

**VeriCred Adaptation:**

- **Layout:** Split — 6-column left (text), 6-column right (diagram)
- **Heading:** Reckless Neue, H2 size, `--ink`
  - Copy: *"How VeriCred Works: The Trinity of Trust"*
- **Body:** Geist Sans, 16px, `--ink-secondary`, max-width `50ch`
  - Copy: "The blockchain proves a credential is real, the AI proves it is not fake, and the student's grant proves it is consented."
- **Diagram:** Styled layer stack showing the verification pipeline (Issue to Hold to Grant to Verify to AI Risk), referencing DoubleZero's OSI layer diagram pattern
- **Background:** `--surface-alt` for subtle section differentiation

#### 05. Key Attributes / Features Section

**DoubleZero Reference:** "Key Attributes" — centered heading, 3-column row with checkmark icons + short label, then CTA pair below.

**VeriCred Adaptation:**

- **Heading:** Reckless Neue Italic, centered, H2 — *"Key Attributes"*
- **Feature cards:** 3-column grid. Each card: checkmark icon (outlined square with check, not filled) + short 2-line label
  - "Immutable on-chain records"
  - "Verifiable in seconds"
  - "Zero-Knowledge proofs"
- **Cards:** No background, no border, no elevation — just icon + text (minimal, DoubleZero style)
- **Dividers:** Vertical hairline between cards (1px `--border`)
- **CTA pair:** Primary accent + outlined secondary

#### 06. Validators / Roles CTA Section

**DoubleZero Reference (Mobile):** "Start Earning 2Z With DoubleZero" — Full-screen CTA section with a small pill badge, large serif heading, body text, primary CTA, outlined CTA, and a social proof stat.

**VeriCred Adaptation:**

- **Badge:** Pill tag — mono font, 12px, `border: 1px solid --border`, `border-radius: 999px`, `px-3 py-1` — "Universities & Issuers"
- **Headline:** Reckless Neue, H2, centered — *"Start Issuing Verified Credentials Today"*
- **Body:** Geist Sans, centered, `--ink-secondary` — "Connect to the VeriCred protocol for tamper-proof, instantly verifiable academic records."
- **Primary CTA:** Accent bg, white text, arrow — "Launch Issuer Console ->"
- **Secondary CTA:** Outlined, full-pill radius — "Student Holder Vault"
- **Social proof:** Small text, centered, `--ink-muted` — "Trusted by 50+ institutions"

#### 07. Footer

**DoubleZero Reference:**
- Full-width logo (very large, spans entire width)
- A decorative "fiber line" animation (thin horizontal line with a glowing pulse traveling across it)
- 4-5 columns of links (Explore, Company, Legal, Social)
- Small eyebrow labels above each column in mono font
- Light/dark mode toggle

**VeriCred Adaptation:**

- **Logo:** Full-width "VeriCred" in large display size
- **Fiber line:** Decorative animated horizontal rule
- **Link columns:** Explore (Verify, Vault, Issuer, Dashboard), Company (About, Careers, Contact), Legal (Privacy, Terms, Cookie), Social (GitHub, X, Discord)
- **Eyebrow labels:** IBM Plex Mono, 11px, uppercase, tracking-wide, `--ink-muted`
- **Links:** Geist Sans, 14px, `--ink-muted`, hover to `--ink` with underline slide-in animation
- **Mode toggle:** Light/dark switch (pill radio group)
- **Copyright:** Bottom, mono, 12px

---

## 5. Button System

### 5.1 Primary CTA

```css
.btn-primary {
  background: var(--accent);          /* #C73E1D coral/red */
  color: white;
  font-family: var(--font-mono);      /* IBM Plex Mono */
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.02em;
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background 200ms ease-out, transform 160ms ease-out;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-primary:active {
  transform: scale(0.97);
}
```

- **Arrow icon:** Sliding arrow animation — arrow slides in from left on hover (per DoubleZero's `dz2-sliding-arrow` pattern)
- **Full-height nav variant:** Extends to viewport edge, no border-radius, taller padding

### 5.2 Secondary / Outlined Button

```css
.btn-secondary {
  background: transparent;
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  padding: 12px 24px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;              /* full-pill */
  cursor: pointer;
  transition: border-color 200ms ease-out, transform 160ms ease-out;
}

.btn-secondary:hover {
  border-color: var(--ink);
}

.btn-secondary:active {
  transform: scale(0.97);
}
```

### 5.3 Ghost / Nav Button

```css
.btn-ghost {
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 14px;
  padding: 8px 24px;
  border: 1px solid var(--border);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 200ms ease-out;
}

.btn-ghost:hover {
  border-color: var(--ink-muted);
}
```

---

## 6. Motion and Animation (per Emil Kowalski + impeccable)

### 6.1 Easing Curves

```css
:root {
  /* Strong ease-out for UI interactions */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);

  /* Smooth ease-in-out for on-screen movement */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);

  /* Gentle reveal for scroll animations */
  --ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 6.2 Animation Inventory

| Element                | Animation                              | Duration | Easing        | Trigger       |
| ---------------------- | -------------------------------------- | -------- | ------------- | ------------- |
| Hero headline          | Fade up from `translateY(20px)`         | 800ms    | `--ease-reveal` | Page load     |
| Hero subtext           | Fade up, 100ms delay after headline    | 800ms    | `--ease-reveal` | Page load     |
| Hero CTAs              | Fade up, 200ms delay                   | 800ms    | `--ease-reveal` | Page load     |
| Section content        | Fade up from `translateY(24px)`         | 600ms    | `--ease-reveal` | Scroll into view (once) |
| Feature cards          | Stagger fade up, 60ms between items    | 600ms    | `--ease-reveal` | Scroll into view |
| Button hover           | Background color transition            | 200ms    | `ease-out`    | Hover         |
| Button press           | `scale(0.97)`                          | 160ms    | `ease-out`    | Active        |
| Sliding arrow (CTA)    | Arrow slides right on hover            | 200ms    | `--ease-out`  | Hover         |
| Nav links hover        | Color transition                       | 150ms    | `ease`        | Hover         |
| Footer fiber line      | Glowing pulse travels left to right    | 1200ms   | `linear`      | Loop (decorative) |
| Announcement bar close | Slide up + height collapse              | 300ms    | `--ease-out`  | Click close   |

### 6.3 Motion Constraints (per impeccable + Emil)

- **No `ease-in`** on any UI element — feels sluggish
- **No `transition: all`** — always specify exact properties
- **`prefers-reduced-motion`** — all motion reduces to opacity-only crossfade or instant
- **No scroll-jacking** — standard browser scroll behavior
- **No marquee** (only 1 allowed per page per design-taste-frontend; not needed here)
- **Max one fiber line animation** in footer — decorative, non-blocking

---

## 7. Iconography

### 7.1 System

- **Primary library:** `@phosphor-icons/react` (already installed) — Light variant for consistency
- **Stroke width:** `1.5` global standard
- **Size:** 20px for inline UI, 24px for feature icons, 16px for nav
- **Color:** `--ink-muted` by default, `--ink` on hover/active

### 7.2 Feature Icons (Key Attributes section)

| Feature          | Icon                                | Description                   |
| ---------------- | ----------------------------------- | ----------------------------- |
| Immutable        | `ShieldCheck` (Phosphor Light)      | Outlined checkmark in shield  |
| Verifiable       | `CheckSquare` (Phosphor Light)      | Square with checkmark         |
| Zero-Knowledge   | `Fingerprint` (Phosphor Light)      | Fingerprint in circle         |
| Instant          | `Lightning` (Phosphor Light)        | Bolt                          |
| Decentralized    | `Graph` (Phosphor Light)            | Connected nodes               |

---

## 8. Background and Visual Effects

### 8.1 Hero Network Visualization

The DoubleZero hero features a **pixelated world map / network visualization** composed of:

1. **Colored pixel blocks** — Small squares (~8-16px) in varying sizes forming an abstract network/globe shape. Colors: deep blue, violet, coral accent, muted sand, with transparency blending into the white background
2. **Thin connection lines** — Gray hairlines connecting node points across the visualization
3. **Node markers** — Small squares (4-6px) with thin borders at line intersection points
4. **Gradient fade** — Edges dissolve into the white background with soft radial gradients

**VeriCred Implementation:**
- Build as a React component using SVG or Canvas
- Pixel blocks represent credential verification nodes
- Connection lines represent the verification network
- Accent colors (blue for institutional, coral for active verification) map to VeriCred's domain
- Should feel generative/data-driven, not decorative

### 8.2 Section Backgrounds

| Section                | Background                           |
| ---------------------- | ------------------------------------ |
| Page default           | `--background` (`#FAFAFA`)           |
| Hero                   | `--background` with network viz overlay |
| How It Works           | `--surface-alt` (`#F5F5F0`)          |
| Key Attributes         | `--background`                       |
| Roles CTA              | `--surface-alt`                      |
| Footer                 | `--background`                       |

### 8.3 Decorative Elements

- **Fiber line** (footer): Thin 1px horizontal rule with a glowing pulse animation — CSS-only, using a pseudo-element with a gradient that translates across
- **No noise/grain overlays** — DoubleZero design is clean, not textured
- **No glassmorphism** — clean flat surfaces, not frosted glass

---

## 9. Responsive Behavior

### 9.1 Mobile (below 768px)

- Nav collapses to hamburger menu (4-dot grid icon + "Menu" label, per DoubleZero mobile pattern)
- Hero headline: `text-3xl`, single column
- CTAs: Stack vertically, full width
- Feature cards: Single column, stacked
- Footer columns: 2-column grid then single column

### 9.2 Tablet (768px to 1024px)

- Nav: Show key links, collapse secondary to dropdown
- Hero: Slightly smaller heading, centered
- Features: 2-column grid
- Split sections: Stack vertically

### 9.3 Desktop (above 1024px)

- Full nav with all links visible
- Hero: Full centered layout with background visualization
- Features: 3-column grid
- Split sections: Side-by-side 6+6 columns

---

## 10. Accessibility

| Requirement                | Implementation                                    |
| -------------------------- | ------------------------------------------------- |
| Color contrast (body)      | 4.5:1 or higher — `#555555` on `#FAFAFA` = 5.6:1  |
| Color contrast (muted)     | `#888888` on `#FAFAFA` = 3.3:1 (use for captions only, not body) |
| Focus states               | `2px solid --accent`, `2px offset`                 |
| Skip-to-content            | Hidden link, visible on focus                      |
| Keyboard navigation        | Tab order matches visual order                     |
| Reduced motion             | `@media (prefers-reduced-motion: reduce)` — remove all transforms, keep opacity |
| Touch targets              | 44x44px minimum on all interactive elements        |
| Alt text                   | All images have descriptive alt text               |
| Semantic HTML              | header, nav, main, section, footer                 |
| aria-label                 | Icon-only buttons (hamburger, close, theme toggle)  |

---

## 11. Implementation Stack

| Layer        | Technology                              | Notes                          |
| ------------ | --------------------------------------- | ------------------------------ |
| Framework    | Next.js 14 (App Router)                 | Already in project             |
| Styling      | Tailwind CSS v3                         | Already in project             |
| Fonts        | `geist` (npm) + `next/font` for Reckless | Add Reckless Neue via `@font-face` |
| Animation    | `motion` (Framer Motion successor)      | Already in project             |
| Icons        | `@phosphor-icons/react`                 | Already in project             |
| Scroll reveal| Motion `whileInView`                    | Lighter than GSAP for this scope |

---

## 12. File Structure (Proposed)

```
app/
  page.tsx                    # Homepage (complete redesign)
  layout.tsx                  # Root layout (update fonts, theme)
  globals.css                 # Design tokens, base styles

components/
  home/
    announcement-bar.tsx      # Dismissible top banner
    navbar.tsx                # Fixed nav with glass effect
    hero.tsx                  # Hero section with network viz
    how-it-works.tsx          # Protocol overview split section
    key-attributes.tsx        # 3-column feature highlights
    roles-cta.tsx             # Role-specific CTA section
    footer.tsx                # Full footer with columns + fiber line
  ui/
    button.tsx                # Primary, Secondary, Ghost variants
    pill-badge.tsx            # Small pill tag component
    sliding-arrow.tsx         # Animated arrow for CTAs
    fiber-line.tsx            # Decorative animated divider
  credential-card.tsx         # Existing
  risk-badge.tsx              # Existing
  seal.tsx                    # Existing
  wallet-connect.tsx          # Existing
  wallet-provider.tsx         # Existing
```

---

## 13. Design Principles Summary

| Principle              | Application in VeriCred                                    |
| ---------------------- | ---------------------------------------------------------- |
| **Editorial authority**| Serif display headings create institutional gravitas        |
| **Restrained palette** | One accent color, neutral base — trust before flash         |
| **Generous whitespace**| Content breathes; no cramming — `py-24` minimum sections   |
| **Typographic contrast**| Serif display vs. grotesque sans vs. mono data = 3 clear voices |
| **Sharp geometry**     | Square cards, minimal radius — precision over softness       |
| **Purposeful motion**  | Fade-up reveals on scroll, press feedback on buttons — no decoration |
| **Trust-first design** | Light background, clean surfaces, clear hierarchy — institutional audience |
| **Network identity**   | Pixelated network visualization connects to blockchain/verification concept |

---

> **NOTE:** This design.md covers the **homepage only**. Inner pages (Verify, Issuer Console, Student Vault) will retain functional UI patterns but adopt the same color, typography, and component tokens defined here.
