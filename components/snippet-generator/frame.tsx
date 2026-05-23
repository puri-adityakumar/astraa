"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { WindowChrome } from "@/lib/snippet-generator/types";

type Props = {
  chrome: WindowChrome;
  filename: string;
  onFilenameChange: (v: string) => void;
  dropShadow: boolean;
  children: ReactNode;
};

export function Frame({ chrome, filename, onFilenameChange, dropShadow, children }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden bg-zinc-900 text-zinc-100",
        dropShadow && "shadow-2xl",
      )}
    >
      {chrome === "macos" && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-yellow-500" aria-hidden />
          <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden />
          <input
            type="text"
            value={filename}
            onChange={(e) => onFilenameChange(e.target.value)}
            aria-label="Filename"
            maxLength={100}
            className={cn(
              "flex-1 bg-transparent text-center text-xs text-zinc-400",
              "outline-none focus:text-zinc-200",
            )}
          />
          <span className="w-12" aria-hidden />
        </div>
      )}
      {children}
    </div>
  );
}
