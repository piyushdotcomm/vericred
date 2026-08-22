"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar({ items, bottomActions }: { items: SidebarItem[], bottomActions?: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border rounded-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[260px] bg-surfaceAlt border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="font-sans font-semibold tracking-wide text-ink flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            VERICRED
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                  isActive 
                    ? "bg-surface border border-border text-ink font-medium shadow-sm" 
                    : "text-inkSecondary hover:text-ink hover:bg-surface/50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-accent" : "text-inkMuted")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {bottomActions && (
          <div className="p-4 border-t border-border">
            {bottomActions}
          </div>
        )}
      </aside>
    </>
  );
}
