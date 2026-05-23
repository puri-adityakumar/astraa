"use client";

import { cn } from "@/lib/utils";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export function ModeToggle() {
  const mode = useSnippetGenerator((s) => s.mode);
  const setMode = useSnippetGenerator((s) => s.setMode);

  return (
    <div
      role="tablist"
      aria-label="Snippet mode"
      className="inline-flex rounded-md border bg-muted p-1"
    >
      {(["code", "screenshot"] as const).map((m) => (
        <button
          key={m}
          role="tab"
          aria-selected={mode === m}
          onClick={() => setMode(m)}
          className={cn(
            "px-3 py-1.5 text-sm rounded min-h-touch",
            mode === m ? "bg-background text-foreground shadow" : "text-muted-foreground",
          )}
        >
          {m === "code" ? "Code" : "Screenshot"}
        </button>
      ))}
    </div>
  );
}
