import { AnnouncementBar } from "@/components/home/announcement-bar";
import { Navbar } from "@/components/home/navbar";
import { Hero } from "@/components/home/hero";
import { AboutSection } from "@/components/home/about-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { KeyAttributes } from "@/components/home/key-attributes";
import { DashboardExplainer } from "@/components/home/dashboard-explainer";
import { RolesCTA } from "@/components/home/roles-cta";
import { Footer } from "@/components/home/footer";
import SplashCursor from "@/components/ui/splash-cursor";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VeriCred | The Trust Primitive for Education",
  description: "Academic credentials secured on-chain. Immutable, instantly verifiable, and mathematically impossible to forge.",
};

export default function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <SplashCursor />
      <main>
        <Hero />
        <AboutSection />
        <HowItWorks />
        <KeyAttributes />
        <DashboardExplainer />
        <RolesCTA />
      </main>
      <Footer />
    </>
  );
}
