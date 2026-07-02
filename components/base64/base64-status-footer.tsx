"use client";

import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

export interface Base64StatusFooterProps {
  inputBytes: number;
  outputBytes: number;
}

export function Base64StatusFooter({ inputBytes, outputBytes }: Base64StatusFooterProps) {
  return (
    <p
      aria-live="polite"
      className={cn("text-xs text-muted-foreground tabular-nums", "pt-3 border-t border-border")}
    >
      {formatBytes(inputBytes)} in → {formatBytes(outputBytes)} out · UTF-8
    </p>
  );
}
