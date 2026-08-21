"use client";

import "./globals.css";
import { Space_Grotesk } from "next/font/google";
import { IBM_Plex_Mono } from "next/font/google";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

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
    <html lang="en" className={`${grotesk.variable} ${plexMono.variable}`}>
      <body className="min-h-[100dvh] font-sans">{children}</body>
    </html>
  );
}
