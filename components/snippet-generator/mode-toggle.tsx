"use client";

import { Code, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

const MODES = [
  { id: "code" as const, label: "Code", Icon: Code },
  { id: "screenshot" as const, label: "Screenshot", Icon: ImageIcon },
];

export function ModeToggle() {
  const mode = useSnippetGenerator((s) => s.mode);
  const setMode = useSnippetGenerator((s) => s.setMode);

  return (
    <div
      role="tablist"
      aria-label="Snippet mode"
      className="inline-flex rounded-md border bg-muted p-0.5"
    >
      {MODES.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            aria-label={label}
            onClick={() => setMode(id)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-sm min-h-touch",
              "transition-colors duration-100 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
