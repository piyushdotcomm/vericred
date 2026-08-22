import { WalletConnect } from "@/components/wallet-connect";
import Link from "next/link";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="font-sans font-bold uppercase text-sm tracking-wide text-ink">
            VeriCred Vault
          </span>
        </Link>
        <WalletConnect />
      </header>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
