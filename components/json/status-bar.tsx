"use client";

import { Check, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function StatusBar() {
  const text = useJsonEditor((s) => s.text);
  const diagnostics = useJsonEditor((s) => s.diagnostics);
  const parsedAt = useJsonEditor((s) => s.parsedAt);
  const valid = diagnostics.length === 0 && parsedAt > 0;
  const lines = text.split("\n").length;
  const bytes = new Blob([text]).size;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        "pt-3 border-t text-xs text-muted-foreground",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="tabular-nums">{formatBytes(bytes)}</span>
        <span aria-hidden className="text-muted-foreground/40">·</span>
        <span className="tabular-nums">{lines} lines</span>
        <span aria-hidden className="text-muted-foreground/40">·</span>
        {valid ? (
          <span className="inline-flex items-center gap-1 text-success">
            <Check className="h-3.5 w-3.5" aria-hidden /> Valid
          </span>
        ) : diagnostics.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-destructive"
            title={diagnostics[0]?.message ?? ""}
          >
            <X className="h-3.5 w-3.5" aria-hidden /> Invalid
          </span>
        ) : (
          <span>Parsing…</span>
        )}
      </div>
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
        100% local
      </span>
    </div>
  );
}
