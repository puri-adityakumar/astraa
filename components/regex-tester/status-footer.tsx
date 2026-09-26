"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusFooterProps {
  matchCount: number;
  elapsedMs: number;
  bytes: number;
  cap: number;
  timedOut: boolean;
  hardTimeout: boolean;
}

function formatKb(bytes: number): string {
  return (bytes / 1024).toFixed(1);
}

export function StatusFooter({
  matchCount,
  elapsedMs,
  bytes,
  cap,
  timedOut,
  hardTimeout,
}: StatusFooterProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        "pt-3 border-t border-border",
        "text-xs text-muted-foreground tabular-nums",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          {matchCount} match{matchCount === 1 ? "" : "es"}
        </span>
        <span aria-hidden="true" className="text-muted-foreground/40">
          ·
        </span>
        <span>{elapsedMs.toFixed(1)} ms</span>
        <span aria-hidden="true" className="text-muted-foreground/40">
          ·
        </span>
        <span>
          {formatKb(bytes)} KB / {formatKb(cap)} KB cap
        </span>
      </div>
      <div className="flex items-center gap-2">
        {hardTimeout ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/50 bg-destructive/10 px-2 py-0.5 text-destructive">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            Pattern hangs &mdash; simplify
          </span>
        ) : timedOut ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-warning">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
            Slow pattern
          </span>
        ) : null}
      </div>
    </div>
  );
}
