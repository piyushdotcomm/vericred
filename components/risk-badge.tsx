import type { RiskReport } from "@/lib/types";

function scoreTone(score: number) {
  if (score >= 70) return "var(--tampered)";
  if (score >= 40) return "var(--revoked)";
  return "var(--valid)";
}

export function RiskBadge({ report }: { report: RiskReport }) {
  const tone = scoreTone(report.score);

  return (
    <div className="rounded-soft border border-ink/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">AI risk score</p>
        <span
          className="font-mono text-2xl font-semibold"
          style={{ color: tone }}
        >
          {report.score}
          <span className="text-sm">/100</span>
        </span>
      </div>

      {report.reasons.length > 0 ? (
        <ul className="mt-3 space-y-1.5 border-t border-ink/10 pt-3">
          {report.reasons.map((reason) => (
            <li key={reason} className="text-sm text-ink/70">
              {reason}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/60">
          No suspicious patterns detected.
        </p>
      )}
    </div>
  );
}
