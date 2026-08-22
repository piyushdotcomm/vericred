"use client";
import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function FiberLine({ className }: { className?: string }) {
  return (
    <div className={cn("w-full h-[1px] relative overflow-hidden bg-border", className)}>
      <motion.div 
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-40"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </div>
  );
}
