"use client";

import { cn } from "@/lib/utils";

export interface Base64StatusFooterProps {
  inputBytes: number;
  outputBytes: number;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function Base64StatusFooter({
  inputBytes,
  outputBytes,
}: Base64StatusFooterProps) {
  return (
    <p
      aria-live="polite"
      className={cn(
        "text-xs text-muted-foreground tabular-nums",
        "pt-3 border-t border-border",
      )}
    >
      {formatBytes(inputBytes)} in → {formatBytes(outputBytes)} out · UTF-8
    </p>
  );
}
