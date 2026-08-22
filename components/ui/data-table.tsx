import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto border border-border rounded-soft bg-surface", className)}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-surfaceAlt">{children}</thead>;
}

export function DataTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-border last:border-0 hover:bg-surfaceAlt/50 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function DataTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn("py-4 px-4 font-mono text-[11px] uppercase tracking-wider text-inkSecondary font-normal", className)}>
      {children}
    </th>
  );
}

export function DataTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("py-4 px-4 text-sm", className)}>{children}</td>;
}
