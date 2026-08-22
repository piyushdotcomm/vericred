"use client";
import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { PillBadge } from "@/components/ui/pill-badge";
import Link from "next/link";

export function RolesCTA() {
  return (
    <section id="issuers" className="py-32 bg-surfaceAlt border-y border-border relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accentBg rounded-full blur-[120px] pointer-events-none opacity-50" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <PillBadge variant="default" className="mb-8 bg-surface text-ink">
            Universities & Issuers
          </PillBadge>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink mb-6 text-balance leading-tight">
            Start Issuing Verified Credentials Today
          </h2>
          
          <p className="body-sm text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Join the decentralized trust network. Issue migration certificates, degrees, and transcripts with zero infrastructure overhead.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/issuer">
              <Button variant="primary" className="px-8 h-14 text-base">
                Open Issuer Console
              </Button>
            </Link>
            <Link href="#">
              <Button variant="ghost" className="px-8 h-14 text-base">
                View Documentation
              </Button>
            </Link>
          </div>

          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="font-mono text-sm text-inkMuted uppercase tracking-wider">
              Trusted by leading institutions worldwide
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
