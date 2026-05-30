"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Base64HexPanelProps {
  bytes: Uint8Array;
}

const MAX_PREVIEW_BYTES = 256;
const COLS = 16;

function toHex(byte: number): string {
  return byte.toString(16).padStart(2, "0").toUpperCase();
}

export function Base64HexPanel({ bytes }: Base64HexPanelProps) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    const preview = bytes.subarray(0, MAX_PREVIEW_BYTES);
    const out: { offset: number; values: number[] }[] = [];
    for (let i = 0; i < preview.length; i += COLS) {
      const slice = Array.from(preview.subarray(i, i + COLS));
      out.push({ offset: i, values: slice });
    }
    return out;
  }, [bytes]);

  if (bytes.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="base64-hex-body"
        className={cn(
          "w-full flex items-center justify-between gap-2",
          "text-sm font-medium text-foreground text-left",
          "min-h-touch -mx-1 px-1 rounded",
          "hover:text-foreground/80 transition-colors duration-100 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <span>
          Hex view{" "}
          <span className="text-muted-foreground text-xs">
            (first {Math.min(MAX_PREVIEW_BYTES, bytes.length)} of {bytes.length} bytes)
          </span>
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150 ease-out",
            open && "rotate-90",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="base64-hex-body"
          className={cn(
            "overflow-x-auto rounded-md border border-border bg-muted/20 p-3",
            "font-mono text-xs leading-relaxed tabular-nums",
          )}
        >
          {rows.map((row) => (
            <div key={row.offset} className="flex gap-4 whitespace-pre">
              <span className="text-muted-foreground select-none">
                {row.offset.toString(16).padStart(4, "0").toUpperCase()}
              </span>
              <span>
                {row.values.map((b) => toHex(b)).join(" ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
