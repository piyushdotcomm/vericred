import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: "VALID" | "TAMPERED" | "REVOKED" | "ACTIVE" | "EXPIRED" | "DENIED";
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    VALID: "bg-validBg text-valid border-valid/20",
    ACTIVE: "bg-validBg text-valid border-valid/20",
    TAMPERED: "bg-tamperedBg text-tampered border-tampered/20",
    REVOKED: "bg-revokedBg text-revoked border-revoked/20",
    EXPIRED: "bg-surfaceAlt text-inkSecondary border-border",
    DENIED: "bg-surfaceAlt text-inkSecondary border-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-sm border font-mono text-xs uppercase tracking-widest font-medium",
        styles[status] || styles.ACTIVE,
        className
      )}
      {...props}
    >
      {status}
    </div>
  );
}
