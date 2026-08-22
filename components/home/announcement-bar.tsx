"use client";
import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-ink text-background flex items-center justify-center px-4 py-2 relative overflow-hidden"
      >
        <Link href="#" className="flex items-center gap-2 text-sm font-mono hover:opacity-80 transition-opacity">
          <span>VeriCred is live on Polygon Amoy Testnet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surfaceElevated/20 rounded-full transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
