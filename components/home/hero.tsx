"use client";
import * as React from "react";
import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { ShieldCheck, FileText, Activity } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative overflow-hidden w-full">
      <AuroraBackground>
        <div className="flex flex-col items-center justify-center pt-20">
          <ContainerScroll
            titleComponent={
              <div className="flex flex-col items-center justify-center mb-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-4"
                >
                  <span className="font-mono text-[10px] sm:text-xs tracking-widest uppercase bg-surface border border-border px-4 py-2 rounded-full shadow-sm text-inkMuted">
                    The Trust Primitive for Education
                  </span>
                </motion.div>

                <div className="h-[200px] w-full flex items-center justify-center mb-4">
                  <TextHoverEffect text="VERICRED" />
                </div>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  className="text-lg md:text-xl text-inkSecondary max-w-2xl mx-auto mb-10 text-balance font-sans"
                >
                  Cryptographic truth for global education. Immutable, instantly verifiable, and mathematically impossible to forge.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Link href="/verify">
                    <HoverBorderGradient
                      containerClassName="rounded-full"
                      as="button"
                      className="bg-ink text-background flex items-center space-x-2 px-8 py-3"
                    >
                      <span>Verify Now &rarr;</span>
                    </HoverBorderGradient>
                  </Link>
                  <Link href="/issuer">
                    <button className="h-[46px] px-8 rounded-full border border-border bg-surface text-ink text-sm font-medium uppercase tracking-tight hover:bg-surfaceAlt transition-colors shadow-sm">
                      Issuer Console
                    </button>
                  </Link>
                </motion.div>
              </div>
            }
          >
            {/* Minimal Dashboard Mockup for the 3D Scroll */}
            <div className="w-full h-full bg-background rounded-xl flex flex-col font-sans overflow-hidden border border-border">
              {/* Header */}
              <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="h-6 w-48 bg-surfaceAlt rounded-md border border-border flex items-center justify-center text-[10px] text-inkMuted font-mono">
                  app.vericred.network
                </div>
                <div className="w-8 h-8 rounded-full bg-ink/10" />
              </div>
              
              {/* Body */}
              <div className="flex-1 p-6 sm:p-10 flex flex-col gap-6 bg-background">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl">Issuer Overview</h3>
                    <p className="text-sm text-inkSecondary">Manage credentials and issue new assets.</p>
                  </div>
                  <button className="px-4 py-2 bg-ink text-background rounded-md text-xs uppercase tracking-widest font-medium">Issue Asset</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 border border-border bg-surface rounded-soft shadow-sm">
                    <p className="text-xs font-mono uppercase text-inkMuted mb-2">Total Issued</p>
                    <p className="text-3xl font-medium">1,248</p>
                  </div>
                  <div className="p-4 border border-border bg-surface rounded-soft shadow-sm">
                    <p className="text-xs font-mono uppercase text-inkMuted mb-2">Revoked</p>
                    <p className="text-3xl font-medium text-revoked">12</p>
                  </div>
                  <div className="p-4 border border-border bg-surface rounded-soft shadow-sm">
                    <p className="text-xs font-mono uppercase text-inkMuted mb-2">Network Verifications</p>
                    <p className="text-3xl font-medium text-valid">8,930</p>
                  </div>
                </div>

                <div className="flex-1 border border-border bg-surface rounded-soft shadow-sm p-4">
                  <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                    <Activity className="w-4 h-4 text-inkSecondary" />
                    <span className="text-sm font-medium">Recent Activity</span>
                  </div>
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center justify-between bg-surfaceAlt/50 p-3 rounded-md border border-border/50">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-valid" />
                          <div>
                            <p className="text-sm font-medium">Asset Issued</p>
                            <p className="text-xs text-inkSecondary">Alice Chen • B.Tech Computer Science</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-inkMuted uppercase">0x4F9...A12</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ContainerScroll>
        </div>
      </AuroraBackground>
    </section>
  );
}
