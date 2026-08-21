import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { IBM_Plex_Mono } from "next/font/google";
import { WalletProvider } from "@/components/wallet-provider";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${plexMono.variable} dark`}
    >
      <body className="min-h-[100dvh] font-sans bg-background text-ink selection:bg-ink selection:text-background">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
