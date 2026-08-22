import type { RiskReport } from "@/lib/types";
import { AlertTriangle, ShieldCheck } from "lucide-react";

function scoreTone(score: number) {
  if (score >= 70) return "text-tampered";
  if (score >= 40) return "text-revoked";
  return "text-valid";
}

function scoreBg(score: number) {
  if (score >= 70) return "bg-tamperedBg border-tampered";
  if (score >= 40) return "bg-revokedBg border-revoked";
  return "bg-validBg border-valid";
}

export function RiskBadge({ report }: { report: RiskReport }) {
  const toneClass = scoreTone(report.score);
  const bgClass = scoreBg(report.score);
  const isHighRisk = report.score >= 70;

  return (
    <div className={`border rounded-soft p-6 ${bgClass}`}>
      <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-4">
        <div className="flex items-center gap-2">
          {isHighRisk ? <AlertTriangle className={`w-5 h-5 ${toneClass}`} /> : <ShieldCheck className={`w-5 h-5 ${toneClass}`} />}
          <p className="font-mono text-xs uppercase tracking-widest text-ink">
            AI_RISK_EVALUATION
          </p>
        </div>
        <span className={`font-mono text-2xl font-medium ${toneClass}`}>
          {report.score}
          <span className="text-sm opacity-50">/100</span>
        </span>
      </div>

      {report.reasons.length > 0 ? (
        <ul className="space-y-2">
          {report.reasons.map((reason) => (
            <li key={reason} className="font-mono text-xs text-ink/80 flex items-start gap-2">
              <span className="text-ink/40 mt-0.5">{">"}</span> {reason}
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-xs text-ink/60 flex items-center gap-2">
          <span className="text-ink/40">{">"}</span> NO_SUSPICIOUS_PATTERNS_DETECTED
        </p>
      )}

      {(report as any).oracleSignature && (
        <div className="mt-4 pt-4 border-t border-border/10">
           <p className={`font-mono text-[10px] uppercase tracking-widest ${isHighRisk ? 'text-tampered' : 'text-valid'}`}>
             ✔ EIP-712 ORACLE ATTESTATION: {(report as any).oracleAddress?.slice(0,10)}...
           </p>
        </div>
      )}
    </div>
  );
}
