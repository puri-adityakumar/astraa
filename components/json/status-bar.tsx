"use client";

import { Check, X, ShieldCheck, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function Pill({
  tone = "neutral",
  Icon,
  children,
  title,
}: {
  tone?: "neutral" | "success" | "destructive";
  Icon?: typeof Check;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5",
        "font-mono text-[10.5px] tabular-nums uppercase tracking-wider",
        tone === "neutral" &&
          "border-border/70 bg-background/60 text-muted-foreground",
        tone === "success" &&
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
        tone === "destructive" &&
          "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      {Icon && <Icon className="h-2.5 w-2.5" aria-hidden />}
      {children}
    </span>
  );
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
        "flex flex-wrap items-center justify-between gap-2",
        "rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5",
        "backdrop-blur-sm",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill Icon={ScanLine}>{formatBytes(bytes)}</Pill>
        <span className="text-[10px] text-muted-foreground/60" aria-hidden>
          ·
        </span>
        <Pill>{lines} ln</Pill>
        <span className="text-[10px] text-muted-foreground/60" aria-hidden>
          ·
        </span>
        {valid ? (
          <Pill tone="success" Icon={Check}>
            Valid
          </Pill>
        ) : diagnostics.length > 0 ? (
          <Pill
            tone="destructive"
            Icon={X}
            title={diagnostics[0]?.message ?? ""}
          >
            Invalid
          </Pill>
        ) : (
          <Pill>Parsing…</Pill>
        )}
      </div>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-sm border border-primary/30",
          "bg-primary/10 px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wider",
          "text-primary",
        )}
      >
        <ShieldCheck className="h-2.5 w-2.5" aria-hidden />
        100% local
      </span>
    </div>
  );
}
