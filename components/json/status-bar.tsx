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

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 px-3 py-1.5",
        "text-[11px] rounded-md border bg-muted/30 text-muted-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="tabular-nums">{formatBytes(new Blob([text]).size)}</span>
        <span className="tabular-nums">{lines} lines</span>
        {valid ? (
          <span className="inline-flex items-center gap-1 text-success">
            <Check className="h-3 w-3" /> Valid
          </span>
        ) : diagnostics.length > 0 ? (
          <span
            className="inline-flex items-center gap-1 text-destructive"
            title={diagnostics[0]?.message ?? ""}
          >
            <X className="h-3 w-3" /> Invalid
          </span>
        ) : null}
      </div>
      <span className="inline-flex items-center gap-1">
        <ShieldCheck className="h-3 w-3 text-success" /> 100% local
      </span>
    </div>
  );
}
