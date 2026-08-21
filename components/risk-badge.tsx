import type { RiskReport } from "@/lib/types";

function scoreTone(score: number) {
  if (score >= 70) return "text-tampered";
  if (score >= 40) return "text-revoked";
  return "text-valid";
}

export function RiskBadge({ report }: { report: RiskReport }) {
  const toneClass = scoreTone(report.score);

  return (
    <div className="border border-border bg-surface p-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-widest text-inkMuted">
          AI_RISK_SCORE
        </p>
        <span className={`font-mono text-2xl font-medium ${toneClass}`}>
          {report.score}
          <span className="text-sm opacity-50">/100</span>
        </span>
      </div>

      {report.reasons.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {report.reasons.map((reason) => (
            <li key={reason} className="font-mono text-[10px] uppercase tracking-widest text-inkMuted before:content-['>'] before:mr-2 before:text-ink/40">
              {reason}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-ink/40">
          {">"} NO_SUSPICIOUS_PATTERNS_DETECTED
        </p>
      )}
    </div>
  );
}
