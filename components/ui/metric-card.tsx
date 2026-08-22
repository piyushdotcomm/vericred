import * as React from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: string;
}

export function MetricCard({ label, value, trend, className, ...props }: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-soft border border-border bg-surface flex flex-col gap-2",
        className
      )}
      {...props}
    >
      <div className="eyebrow">{label}</div>
      <div className="font-serif text-4xl text-ink">{value}</div>
      {trend && <div className="text-sm font-mono text-inkSecondary mt-2">{trend}</div>}
    </div>
  );
}
