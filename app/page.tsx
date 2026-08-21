import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          VeriCred
        </Link>
        <WalletConnect />
      </header>

      <section className="flex flex-1 flex-col justify-center pt-16">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Your degree, owned by you.
          <br />
          Verified in seconds.
        </h1>
        <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-ink/70 md:text-lg">
          VeriCred replaces paper transcripts with tamper-proof digital
          credentials. The blockchain proves they are real. The AI flags the
          fakes that look real.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/verify"
            className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:-translate-y-[1px] active:translate-y-0"
          >
            Verify a credential
          </Link>
          <Link
            href="/student"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0"
          >
            Student vault
          </Link>
          <Link
            href="/issuer"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0"
          >
            Issuer portal
          </Link>
        </div>
      </section>
    </main>
  );
}
