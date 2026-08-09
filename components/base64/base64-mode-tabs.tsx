"use client";

import { cn } from "@/lib/utils";
import type { Base64Mode } from "@/lib/base64";

const MODE_LABELS: Record<Base64Mode, string> = {
  encode: "Encode",
  decode: "Decode",
};

export interface Base64ModeTabsProps {
  mode: Base64Mode;
  onChange: (mode: Base64Mode) => void;
}

export function Base64ModeTabs({ mode, onChange }: Base64ModeTabsProps) {
  return (
    <div
      role="group"
      aria-label="Base64 operation"
      className="grid min-h-touch w-full grid-cols-2 items-center justify-center rounded-lg border bg-muted/50 p-0.5 text-muted-foreground"
    >
      {(["encode", "decode"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={cn(
            "inline-flex min-h-touch items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            mode === value && "border-border bg-background text-foreground shadow-geist",
          )}
        >
          {MODE_LABELS[value]}
        </button>
      ))}
    </div>
  );
}
