"use client";
import * as React from "react";
import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section className="py-24 bg-surfaceAlt border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow mb-4 block">The Trinity of Trust</span>
            <h2 className="font-serif text-4xl lg:text-5xl text-ink mb-6">
              What is VeriCred?
            </h2>
            <div className="space-y-6 text-lg text-inkSecondary leading-relaxed">
              <p>
                VeriCred replaces fragile paper documents with cryptographically signed credentials. But we do not just rely on the blockchain. We rely on the <strong>Trinity of Trust</strong>.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-accent mr-3 mt-1">✦</span>
                  <span><strong>The Blockchain proves it is real.</strong> Every credential is anchored on-chain by the issuing university. Tamper with one character, and the hash breaks.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 mt-1">✦</span>
                  <span><strong>The AI proves it is not fake.</strong> Our deterministic risk layer spots diploma-mill patterns and anomalous issuance before a human ever trusts them.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 mt-1">✦</span>
                  <span><strong>The Student proves it is consented.</strong> The credential holder issues expiring, revocable grants. The institution is no longer the gatekeeper.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Diagram/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-full min-h-[400px] rounded-soft border border-border bg-surface shadow-sm overflow-hidden flex flex-col items-center justify-center p-8"
          >
            {/* Visual representation of Issue -> Hold -> Grant -> Verify */}
            <div className="w-full flex justify-between items-center relative z-10 max-w-md mx-auto">
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-surfaceAlt border border-border flex items-center justify-center mb-3 mx-auto shadow-sm">
                  <span className="font-serif text-xl">1</span>
                </div>
                <div className="eyebrow">Issue</div>
              </div>

              <div className="flex-1 h-[2px] bg-border mx-2 relative">
                <div className="absolute inset-0 bg-accent/30 origin-left animate-[scale-x_2s_ease-in-out_infinite]" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-accent text-white shadow-md flex items-center justify-center mb-3 mx-auto">
                  <span className="font-serif text-xl">2</span>
                </div>
                <div className="eyebrow text-ink font-bold">Hold</div>
              </div>

              <div className="flex-1 h-[2px] bg-border mx-2 relative">
                 <div className="absolute inset-0 bg-accent/30 origin-left animate-[scale-x_2s_ease-in-out_infinite_0.5s]" />
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-validBg border border-valid/20 text-valid flex items-center justify-center mb-3 mx-auto shadow-sm">
                  <span className="font-serif text-xl">3</span>
                </div>
                <div className="eyebrow">Verify</div>
              </div>

            </div>

            <div className="mt-12 text-center text-sm font-mono text-inkMuted max-w-xs">
              <p>The student controls the flow of their own data via cryptographic grants.</p>
            </div>
            
            {/* Decorative background grid */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-small)" />
            </svg>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
