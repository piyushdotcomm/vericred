"use client";
import * as React from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HoverEffect } from "@/components/ui/card-hover-effect";

export function KeyAttributes() {
  const attributes = [
    { title: "Immutable on-chain records" },
    { title: "Verifiable in seconds" },
    { title: "Zero-Knowledge proofs ready" },
    { title: "Expiring access grants" },
    { title: "Transparent audit logs" },
    { title: "Wallet-free verification" },
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="font-serif italic text-3xl md:text-4xl text-ink">
            Key Attributes
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-8">
          <HoverEffect items={attributes} />
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex justify-center gap-4"
        >
          <Link href="/verify">
            <Button variant="primary">Verify a Document</Button>
          </Link>
          <Link href="/student">
            <Button variant="secondary" className="bg-surface">Open Student Vault</Button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
