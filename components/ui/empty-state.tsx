import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-soft bg-surfaceAlt/50",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-inkMuted">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-xl text-ink mb-2">{title}</h3>
      <p className="body-sm max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
