import type { VerificationStatus } from "@/lib/types";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

export function Seal({ status }: { status: VerificationStatus }) {
  const isTampered = status === "TAMPERED";
  const isRevoked = status === "REVOKED";
  const isExpired = status === "EXPIRED";
  const isValid = status === "VALID";

  const colorClass = isTampered
    ? "text-tampered border-tampered bg-tamperedBg"
    : isRevoked
      ? "text-revoked border-revoked bg-revokedBg"
      : isExpired
        ? "text-inkMuted border-inkMuted bg-transparent"
        : isValid
          ? "text-valid border-valid bg-validBg"
          : "text-inkMuted border-inkMuted bg-transparent";

  const label = status;

  return (
    <div
      className={`relative flex h-20 w-20 shrink-0 items-center justify-center rounded-none border-[1px] p-1 ${colorClass}`}
      aria-label={`Verification status: ${label}`}
    >
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1 border-[1px] border-dashed ${colorClass}`}
      >
        {isValid && <CheckCircle2 className="h-5 w-5" />}
        {isTampered && <AlertTriangle className="h-5 w-5" />}
        {isRevoked && <XCircle className="h-5 w-5" />}
        {isExpired && <Clock className="h-5 w-5" />}
        {!isValid && !isTampered && !isRevoked && !isExpired && (
          <XCircle className="h-5 w-5" />
        )}
      </div>
    </div>
  );
}
