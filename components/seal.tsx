import type { VerificationStatus } from "@/lib/types";

const statusColor: Record<VerificationStatus, string> = {
  VALID: "var(--valid)",
  TAMPERED: "var(--tampered)",
  REVOKED: "var(--revoked)",
  EXPIRED: "#6B7280",
  DENIED: "#6B7280",
};

const statusLabel: Record<VerificationStatus, string> = {
  VALID: "VALID",
  TAMPERED: "TAMPERED",
  REVOKED: "REVOKED",
  EXPIRED: "EXPIRED",
  DENIED: "DENIED",
};

export function Seal({ status }: { status: VerificationStatus }) {
  const color = statusColor[status];
  const label = statusLabel[status];

  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2"
      style={{ borderColor: color }}
      aria-label={`Verification status: ${label}`}
    >
      <div
        className="flex h-[76px] w-[76px] items-center justify-center rounded-full border"
        style={{ borderColor: color }}
      >
        <span
          className="text-center font-mono text-[11px] font-semibold uppercase leading-tight tracking-wide"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
