import type { Credential } from "@/lib/types";
import { Seal } from "./seal";
import type { VerificationStatus } from "@/lib/types";

const docTypeLabel: Record<Credential["docType"], string> = {
  transcript: "Transcript",
  migration: "Migration Certificate",
  degree: "Degree Certificate",
};

export function CredentialCard({
  credential,
  status,
}: {
  credential: Credential;
  status: VerificationStatus;
}) {
  return (
    <article className="rounded-soft border border-ink/10 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
            {docTypeLabel[credential.docType]}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug">
            {credential.studentName}
          </h3>
          <p className="mt-1 text-sm text-ink/70">{credential.course}</p>
        </div>
        <Seal status={status} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-sm">
        <div>
          <dt className="text-ink/50">Issuer</dt>
          <dd className="font-medium">{credential.issuerName}</dd>
        </div>
        <div>
          <dt className="text-ink/50">Roll No</dt>
          <dd className="font-mono">{credential.rollNumber}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-ink/50">Issued</dt>
          <dd className="font-mono text-xs">
            {new Date(credential.issuedAt).toLocaleDateString("en-IN")}
          </dd>
        </div>
      </dl>
    </article>
  );
}
