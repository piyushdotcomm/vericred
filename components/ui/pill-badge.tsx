import * as React from "react";
import { cn } from "@/lib/utils";

interface PillBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "valid" | "tampered" | "revoked";
}

export function PillBadge({ className, variant = "default", ...props }: PillBadgeProps) {
  const variants = {
    default: "border border-border text-inkSecondary",
    valid: "border border-valid text-valid",
    tampered: "border border-tampered text-tampered",
    revoked: "border border-revoked text-revoked",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-pill font-mono text-[11px] uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
