"use client";
import * as React from "react";
import { motion } from "motion/react";
import { FileSignature, Wallet, Share2, ShieldCheck, Cpu } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: FileSignature,
      title: "Issue",
      description: "University issues a tamper-proof credential and anchors its hash on the blockchain."
    },
    {
      icon: Wallet,
      title: "Hold",
      description: "Student receives the digital credential in their secure self-sovereign vault."
    },
    {
      icon: Share2,
      title: "Grant",
      description: "Student issues an expiring, revocable grant to an employer or institution."
    },
    {
      icon: ShieldCheck,
      title: "Verify",
      description: "Verifier checks the hash and signature instantly without needing a wallet."
    },
    {
      icon: Cpu,
      title: "Analyze",
      description: "AI screens the credential for mass-issuance and diploma-mill anomalies."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="eyebrow mb-4 block">The Mechanism</span>
          <h2 className="font-serif text-4xl text-ink mb-4">How It Works</h2>
          <p className="body-sm text-lg">A seamless flow from issuance to verification, placing the student at the center of their own academic identity.</p>
        </div>

        <div className="relative">
          {/* Desktop horizontal connecting line */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-[1px] bg-border z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center mb-6 relative group-hover:border-accent transition-colors duration-300">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-mono text-sm shadow-md">
                      {index + 1}
                    </div>
                    <Icon className="w-8 h-8 text-inkSecondary group-hover:text-ink transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif text-xl mb-2 text-ink">{step.title}</h3>
                  <p className="body-sm px-2">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
