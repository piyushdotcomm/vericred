import * as React from "react";
import Link from "next/link";
import { FiberLine } from "@/components/ui/fiber-line";

export function Footer() {
  return (
    <footer className="bg-background pt-16 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="font-sans font-bold uppercase tracking-widest text-lg text-ink">
                VeriCred
              </span>
            </Link>
            <p className="body-sm max-w-sm">
              The self-sovereign academic credential wallet built on the Trinity of Trust.
            </p>
          </div>
          
          <div>
            <h4 className="eyebrow mb-4 text-ink">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/issuer" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Issuer Console</Link></li>
              <li><Link href="/student" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Student Vault</Link></li>
              <li><Link href="/verify" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Verifier Portal</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="eyebrow mb-4 text-ink">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Documentation</Link></li>
              <li><Link href="#" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Smart Contracts</Link></li>
              <li><Link href="#" className="text-sm text-inkSecondary hover:text-ink hover:underline underline-offset-4 decoration-accent transition-all">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <FiberLine className="mb-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs text-inkMuted">
            &copy; {new Date().getFullYear()} VeriCred Protocol. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="font-mono text-xs text-inkMuted hover:text-ink transition-colors">Twitter</Link>
            <Link href="#" className="font-mono text-xs text-inkMuted hover:text-ink transition-colors">GitHub</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
