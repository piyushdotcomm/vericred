import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] font-mono";

    const variants = {
      primary: "bg-accent text-white rounded-sm px-6 py-3 hover:bg-accentHover",
      secondary: "border border-borderStrong bg-transparent text-ink rounded-pill px-6 py-3 hover:bg-surfaceAlt",
      ghost: "bg-transparent text-ink rounded-pill px-6 py-3 hover:bg-surfaceAlt",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
