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
    ? "bg-tamperedBg/50"
    : isRevoked
      ? "bg-revokedBg/50"
      : "bg-surface";

  return (
    <article
      className={`relative w-full max-w-2xl overflow-hidden rounded-soft border border-border p-8 shadow-sm transition-all hover:shadow-md ${bgGradient}`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted">
              CREDENTIAL_ID: {credential.id || "0X9A4F...B72"}
            </p>
            <h3 className="font-serif text-3xl tracking-tight text-ink uppercase">
              {credential.studentName}
            </h3>
            <p className="font-mono text-sm tracking-tight text-inkSecondary uppercase">
              {credential.course}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px bg-border pt-px pb-px rounded-sm overflow-hidden border border-border">
            <div className="bg-surfaceAlt p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                ISSUER_ENTITY
              </p>
              <p className="font-sans text-sm text-ink font-medium truncate">
                {credential.issuerName}
              </p>
            </div>
            <div className="bg-surfaceAlt p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                ROLL_REF
              </p>
              <p className="font-mono text-sm text-ink font-medium">
                {credential.rollNumber}
              </p>
            </div>
            <div className="bg-surfaceAlt p-4 col-span-2 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                  TIMESTAMP
                </p>
                <p className="font-mono text-xs text-ink font-medium">
                  {new Date(credential.issuedAt).toISOString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-inkMuted mb-1">
                  CLASS
                </p>
                <p className="font-mono text-xs text-ink font-medium">
                  {docTypeLabel[credential.docType]}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
          <Seal status={status} />

          <div
            className={`mt-auto text-right font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-sm border ${statusColor}`}
          >
            STATUS: {status}
          </div>
        </div>
      </div>
    </article>
  );
}
