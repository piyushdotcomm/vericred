import type { Credential } from "@/lib/types";
import { Seal } from "./seal";
import type { VerificationStatus } from "@/lib/types";

const docTypeLabel: Record<Credential["docType"], string> = {
  transcript: "TRANSCRIPT",
  migration: "MIGRATION_CERTIFICATE",
  degree: "DEGREE_CERTIFICATE",
};

export function CredentialCard({
  credential,
  status,
}: {
  credential: Credential;
  status: VerificationStatus;
}) {
  const isTampered = status === "TAMPERED";
  const isRevoked = status === "REVOKED";

  const statusColor = isTampered
    ? "text-tampered border-tampered bg-tamperedBg"
    : isRevoked
      ? "text-revoked border-revoked bg-revokedBg"
      : "text-valid border-valid bg-validBg";

  const bgGradient = isTampered
    ? "bg-gradient-to-br from-[#1A0000] to-black"
    : isRevoked
      ? "bg-gradient-to-br from-[#1A1000] to-black"
      : "bg-gradient-to-br from-[#001A0A] to-black";

  return (
    <article
      className={`relative w-full max-w-2xl overflow-hidden rounded-none border border-border bg-surface p-8 shadow-2xl transition-all hover:border-ink/20 ${bgGradient}`}
    >
      {/* Tech decoration */}
      <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted">
              // CREDENTIAL_ID: {credential.id || "0X9A4F...B72"}
            </p>
            <h3 className="font-sans text-3xl font-medium tracking-tight text-ink uppercase">
              {credential.studentName}
            </h3>
            <p className="font-mono text-sm tracking-tight text-inkMuted uppercase">
              {credential.course}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border pt-px pb-px">
            <div className="bg-surfaceElevated p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                ISSUER_ENTITY
              </p>
              <p className="font-sans text-sm text-ink truncate">
                {credential.issuerName}
              </p>
            </div>
            <div className="bg-surfaceElevated p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                ROLL_REF
              </p>
              <p className="font-mono text-sm text-ink">
                {credential.rollNumber}
              </p>
            </div>
            <div className="bg-surfaceElevated p-4 col-span-2 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                  TIMESTAMP
                </p>
                <p className="font-mono text-xs text-ink">
                  {new Date(credential.issuedAt).toISOString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                  CLASS
                </p>
                <p className="font-mono text-xs text-ink">
                  {docTypeLabel[credential.docType]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
          <Seal status={status} />

          <div
            className={`mt-auto text-right font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${statusColor}`}
          >
            STATUS: {status}
          </div>
        </div>
      </div>

      {/* Decorative scanline */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20 mix-blend-overlay" />
    </article>
  );
}
