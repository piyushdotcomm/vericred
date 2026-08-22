import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import { WalletProvider } from "@/components/wallet-provider";
import { ToastProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, plexMono.variable, playfair.variable, "font-sans")}
    >
      <body className="min-h-[100dvh] font-sans bg-background text-ink selection:bg-ink selection:text-background">
        <WalletProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
