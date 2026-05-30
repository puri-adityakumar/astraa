"use client";

import {
  AlertCircle,
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Base64Mode, Base64Status } from "@/lib/base64";

export interface Base64OutputProps {
  mode: Base64Mode;
  output: string;
  status: Base64Status;
  onCopy: () => void;
  onDownload: () => void;
  onSwap: () => void;
  onClear: () => void;
}

function StatusPill({ status }: { status: Base64Status }) {
  if (status.kind === "valid") {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1 rounded-full",
          "border border-success/40 bg-success/10 text-success",
          "px-2 py-0.5 text-xs",
        )}
      >
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Valid base64
      </span>
    );
  }
  if (status.kind === "invalid") {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1 rounded-full",
          "border border-destructive/40 bg-destructive/10 text-destructive",
          "px-2 py-0.5 text-xs",
        )}
      >
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        Invalid: {status.reason}
      </span>
    );
  }
  if (status.kind === "error") {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "inline-flex items-center gap-1 rounded-full",
          "border border-destructive/40 bg-destructive/10 text-destructive",
          "px-2 py-0.5 text-xs",
        )}
      >
        <AlertCircle className="h-3 w-3" aria-hidden="true" />
        {status.message}
      </span>
    );
  }
  return null;
}

export function Base64Output({
  mode,
  output,
  status,
  onCopy,
  onDownload,
  onSwap,
  onClear,
}: Base64OutputProps) {
  const isEmpty = output.length === 0;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="base64-output" className="text-sm font-medium">
          Output
        </Label>
        {mode === "decode" && <StatusPill status={status} />}
      </div>

      <Textarea
        id="base64-output"
        readOnly
        value={output}
        placeholder={
          mode === "encode"
            ? "Encoded base64 will appear here."
            : "Decoded text will appear here."
        }
        aria-label="Output"
        className={cn(
          "font-mono text-sm leading-relaxed min-h-[8rem] resize-y",
          "bg-muted/30",
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={isEmpty}
          aria-label="Copy output"
          className="min-h-touch"
        >
          <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
          Copy
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={isEmpty}
          aria-label="Download output as file"
          className="min-h-touch"
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Download
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSwap}
          disabled={isEmpty}
          aria-label="Use output as input and flip mode"
          className="min-h-touch"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" aria-hidden="true" />
          Swap
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
          aria-label="Clear input and output"
          className="min-h-touch"
        >
          <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
          Clear
        </Button>
      </div>
    </div>
  );
}
