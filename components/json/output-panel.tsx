"use client";

import { Copy, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OutputFormat = {
  id: string;
  label: string;
  ext: string;
};

type OutputPanelProps = {
  formats: OutputFormat[];
  format: string;
  onFormatChange: (id: string) => void;
  output: string;
  error: string | null;
  onCopy: () => void;
  onDownload: () => void;
  pending?: boolean;
};

/**
 * Shared presentational shell for the JSON tool's convert/generate views.
 *
 * Renders the format-tab bar, the error block, the read-only output textarea
 * (or a "Generating…" spinner when `pending`), and the Copy + Download button
 * row. The data logic (converters/generators, async effects, state) lives in
 * the consuming views; this component only renders the shared chrome. The
 * consuming view owns the copy toast label and download filename — they are
 * encoded in the `onCopy`/`onDownload` handlers it passes down.
 */
export function OutputPanel(props: OutputPanelProps) {
  const {
    formats,
    format,
    onFormatChange,
    output,
    error,
    onCopy,
    onDownload,
    pending = false,
  } = props;

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border bg-muted p-0.5">
        {formats.map((f) => (
          <button
            key={f.id}
            onClick={() => onFormatChange(f.id)}
            aria-pressed={format === f.id}
            className={cn(
              "px-3 py-1.5 text-sm rounded-sm min-h-touch",
              "transition-colors duration-100 ease-out",
              format === f.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          className={cn(
            "flex items-start gap-2 p-3 rounded-md border",
            "border-destructive/40 bg-destructive/10 text-destructive text-sm",
          )}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : pending ? (
        <div
          className={cn(
            "flex items-center gap-2 h-[50vh] p-3 rounded-md border",
            "bg-muted/30 text-sm text-muted-foreground",
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>Generating…</span>
        </div>
      ) : (
        <textarea
          readOnly
          value={output}
          spellCheck={false}
          placeholder="Output will appear here…"
          className={cn("w-full h-[50vh] p-3 rounded-md border bg-muted/30", "font-mono text-xs")}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onCopy} disabled={!output || pending}>
          <Copy className="h-4 w-4 mr-2" aria-hidden /> Copy
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} disabled={!output || pending}>
          <Download className="h-4 w-4 mr-2" aria-hidden /> Download
        </Button>
      </div>
    </div>
  );
}
