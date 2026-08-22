"use client";
import * as React from "react";
import { motion } from "motion/react";
import { Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function DashboardExplainer() {
  const cards = [
    {
      title: "Issuer Console",
      icon: Building2,
      description: "Universities issue tamper-proof credentials. Upload documents, hash them on-chain, and deliver digital keys to students in seconds.",
      features: ["Issue certificates", "Revoke credentials", "AI OCR auto-fill", "Activity audit log"],
      ctaText: "Open Issuer Console",
      href: "/issuer",
      color: "bg-surface"
    },
    {
      title: "Student Vault",
      icon: GraduationCap,
      description: "Your credentials, your control. View all issued documents, share via QR with expiring grants, and track who accessed what.",
      features: ["Credential wallet", "QR sharing", "Revocable access grants", "Access log transparency"],
      ctaText: "Open Vault",
      href: "/student",
      color: "bg-surfaceAlt"
    },
    {
      title: "Verifier Portal",
      icon: ShieldCheck,
      description: "Verify any credential in under 5 seconds. No wallet needed, no login required. Paste JSON or scan a QR code.",
      features: ["Wallet-free verification", "AI fraud detection", "Hash & signature check", "Instant results"],
      ctaText: "Verify Now",
      href: "/verify",
      color: "bg-surface"
    }
  ];

  return (
    <section className="py-24 bg-background border-t border-border relative overflow-hidden">
      
      {/* Floating Mock Credentials */}
      <motion.div 
        className="absolute top-10 left-[10%] hidden lg:block opacity-40 pointer-events-none select-none w-64 p-4 border border-border bg-surface rounded-md shadow-lg transform -rotate-12"
        animate={{ y: [0, -20, 0], rotate: [-12, -8, -12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-ink/10" />
          <div>
            <div className="w-24 h-2 bg-ink/20 rounded-full mb-1" />
            <div className="w-16 h-2 bg-ink/10 rounded-full" />
          </div>
        </div>
        <div className="w-full h-24 bg-ink/5 rounded-sm" />
      </motion.div>

      <motion.div 
        className="absolute top-20 right-[5%] hidden lg:block opacity-30 pointer-events-none select-none w-72 p-4 border border-border bg-surface rounded-md shadow-xl transform rotate-6"
        animate={{ y: [0, 20, 0], rotate: [6, 12, 6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-accent/20 rounded-sm" />
          <div>
            <div className="w-32 h-2 bg-ink/20 rounded-full mb-1" />
            <div className="w-20 h-2 bg-ink/10 rounded-full" />
          </div>
        </div>
        <div className="w-full h-16 bg-ink/5 rounded-sm mb-2" />
        <div className="w-2/3 h-4 bg-valid/20 rounded-sm" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16 relative">
          <span className="eyebrow mb-4 block">Dedicated Interfaces</span>
          <h2 className="font-serif text-3xl md:text-4xl text-ink">Three Roles, Three Dashboards</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-soft border border-border p-8 flex flex-col ${card.color} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="w-12 h-12 rounded-sm bg-background border border-border flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-ink" />
                </div>
                
                <h3 className="font-serif text-2xl text-ink mb-4">{card.title}</h3>
                <p className="body-sm mb-8 flex-1">{card.description}</p>
                
                <div className="mb-8 space-y-3">
                  {card.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-sm font-medium text-inkSecondary">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Link href={card.href} className="mt-auto">
                  <Button variant="secondary" className="w-full justify-between bg-background">
                    {card.ctaText}
                    <span className="font-sans ml-2">&rarr;</span>
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
