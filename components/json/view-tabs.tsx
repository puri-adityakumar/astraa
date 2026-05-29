"use client";

import { FileCode, Network, ArrowLeftRight, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";
import type { View } from "@/lib/json/types";

const VIEWS: { id: View; label: string; short: string; Icon: typeof FileCode }[] = [
  { id: "text", label: "Text", short: "TXT", Icon: FileCode },
  { id: "tree", label: "Tree", short: "TRE", Icon: Network },
  { id: "convert", label: "Convert", short: "CNV", Icon: ArrowLeftRight },
  { id: "generate", label: "Generate", short: "GEN", Icon: Wand2 },
];

export function ViewTabs() {
  const view = useJsonEditor((s) => s.view);
  const setView = useJsonEditor((s) => s.setView);
  return (
    <div
      role="tablist"
      aria-label="JSON Editor view"
      className={cn(
        "inline-flex rounded-md border border-border/80 bg-muted/40 p-0.5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
      )}
    >
      {VIEWS.map(({ id, label, short, Icon }) => {
        const active = view === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            aria-label={label}
            onClick={() => setView(id)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm",
              "text-[11px] font-mono tracking-wider uppercase min-h-touch",
              "transition-colors duration-100 ease-out",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
            {active && (
              <span
                className="absolute -bottom-px left-1/2 h-px w-6 -translate-x-1/2 bg-primary/70"
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
