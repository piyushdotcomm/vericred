import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SlidingArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      className={cn(
        "w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1",
        className
      )}
    />
  );
}
