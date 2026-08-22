"use client";

import { Sidebar } from "@/components/ui/sidebar";
import { LayoutDashboard, FileSignature, Activity, Settings } from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";

export default function IssuerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-background flex">
      <Sidebar 
        items={[
          { name: "Overview", href: "/issuer", icon: LayoutDashboard },
          { name: "Issue Asset", href: "/issuer#issue", icon: FileSignature },
          { name: "Activity Log", href: "/issuer#log", icon: Activity },
        ]}
        bottomActions={<WalletConnect />}
      />
      <div className="flex-1 lg:ml-[260px] min-h-[100dvh]">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border flex items-center justify-end px-4 bg-surface sticky top-0 z-30">
          <WalletConnect />
        </header>
        {children}
      </div>
    </div>
  );
}
