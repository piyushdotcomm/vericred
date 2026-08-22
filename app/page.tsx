"use client";
import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Database, Fingerprint } from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-background text-ink min-h-[100dvh] flex flex-col overflow-hidden">
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <Link
          href="/"
          className="text-sm font-medium tracking-widest uppercase flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-accent rounded-full" />
          VeriCred
        </Link>
        <WalletConnect />
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex flex-col justify-end px-6 pb-24 md:pb-32 pt-32">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_50%)]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto w-full relative z-10">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-sans tracking-tighter leading-[1.1] uppercase">
                Zero-Trust <br />
                <span className="text-inkMuted">Verification.</span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="max-w-xl text-lg md:text-xl text-inkMuted leading-relaxed"
            >
              Academic credentials secured on-chain. Immutable, instantly
              verifiable, and mathematically impossible to forge. The new
              standard for institutional trust.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex flex-wrap gap-4 mt-4 relative z-10"
            >
              <Link
                href="/verify"
                className="group flex items-center gap-2 bg-accent text-background px-6 py-4 text-sm font-medium tracking-wide uppercase transition-colors hover:bg-accentHover"
              >
                Verify Asset
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/issuer"
                className="flex items-center justify-center border border-border bg-surface px-6 py-4 text-sm font-medium tracking-wide uppercase transition-colors hover:border-ink/50"
              >
                Issuer Console
              </Link>
              <Link
                href="/student"
                className="flex items-center justify-center border border-border bg-surface px-6 py-4 text-sm font-medium tracking-wide uppercase transition-colors hover:border-ink/50"
              >
                Holder Vault
              </Link>
            </motion.div>
          </div>
          <div className="lg:col-span-4 flex items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full aspect-[3/4] bg-surface border border-border p-6 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="flex justify-between items-start relative z-10">
                <p className="font-mono text-xs tracking-widest uppercase text-inkMuted">
                  SYSTEM_STATUS
                </p>
                <div className="w-2 h-2 bg-valid rounded-full animate-pulse" />
              </div>

              {/* Decorative Terminal/Logs filling the middle space */}
              <div className="flex-1 flex flex-col justify-center gap-2 opacity-30 py-8 relative z-10">
                <p className="font-mono text-[10px] text-ink/50 truncate">{"[NODE] Syncing block headers..."}</p>
                <p className="font-mono text-[10px] text-ink/50 truncate">{"[TX] 0x4a9...b11 verified"}</p>
                <p className="font-mono text-[10px] text-ink/50 truncate">{"[P2P] 12 peers connected"}</p>
                <p className="font-mono text-[10px] text-ink/50 truncate">{"[VM] Executing call to 0x5Fb..."}</p>
                <p className="font-mono text-[10px] text-valid truncate">{"[OK] Network consensus reached"}</p>
              </div>

              {/* Decorative scanline for the rectangle */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />

              <div className="space-y-2 relative z-10">
                <p className="font-mono text-[10px] text-inkMuted">
                  LATEST_BLOCK
                </p>
                <p className="font-mono text-lg truncate text-ink">
                  0x8F2A...9C1
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-6 border-t border-border bg-surface relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl tracking-tighter uppercase">
              Protocol Features
            </h2>
            <p className="text-inkMuted max-w-lg">
              Engineered for absolute cryptographic certainty. No
              intermediaries, no points of failure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cell 1 */}
            <div className="md:col-span-2 min-h-[320px] bg-background border border-border p-8 flex flex-col justify-between relative group hover:border-ink/20 transition-colors">
              <ShieldCheck className="w-8 h-8 text-inkMuted" />
              <div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-2">
                  Cryptographic Proof
                </h3>
                <p className="text-inkMuted max-w-md">
                  Every credential is hashed and anchored to the blockchain.
                  Tampering with a single byte invalidates the entire record
                  instantly.
                </p>
              </div>
            </div>
            {/* Cell 2 */}
            <div className="min-h-[320px] bg-background border border-border p-8 flex flex-col justify-between relative hover:border-ink/20 transition-colors">
              <Database className="w-8 h-8 text-inkMuted" />
              <div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-2">
                  Decentralized Storage
                </h3>
                <p className="text-inkMuted">
                  No single point of failure. Data lives permanently on IPFS,
                  independent of any central server.
                </p>
              </div>
            </div>
            {/* Cell 3 */}
            <div className="min-h-[320px] bg-background border border-border p-8 flex flex-col justify-between relative hover:border-ink/20 transition-colors">
              <Fingerprint className="w-8 h-8 text-inkMuted" />
              <div>
                <h3 className="text-xl font-medium uppercase tracking-tight mb-2">
                  Zero-Knowledge
                </h3>
                <p className="text-inkMuted">
                  Verify authenticity without exposing underlying personal
                  identifiable information.
                </p>
              </div>
            </div>
            {/* Cell 4 */}
            <div className="md:col-span-2 min-h-[320px] bg-background border border-border p-8 flex flex-col justify-between relative overflow-hidden hover:border-ink/20 transition-colors">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
              <div className="relative z-10 flex flex-col justify-end h-full">
                <h3 className="text-xl font-medium uppercase tracking-tight mb-2">
                  Instant Validation
                </h3>
                <p className="text-inkMuted max-w-md">
                  What used to take weeks of institutional back-and-forth now
                  takes milliseconds via smart contract resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-background">
        <p className="font-mono text-xs text-inkMuted uppercase tracking-widest">
          © 2026 VeriCred Protocol
        </p>
        <div className="flex gap-4">
          <Link
            href="/student"
            className="font-mono text-xs text-inkMuted hover:text-ink uppercase tracking-widest transition-colors"
          >
            Vault
          </Link>
          <Link
            href="/issuer"
            className="font-mono text-xs text-inkMuted hover:text-ink uppercase tracking-widest transition-colors"
          >
            Issuer
          </Link>
        </div>
      </footer>
    </main>
  );
}
