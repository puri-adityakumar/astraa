"use client";

import { useRef } from "react";
import { CloudUpload } from "lucide-react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  onPick: (file: File) => void;
  variant?: "empty" | "overlay";
  visible?: boolean;
};

export function Dropzone({ onPick, variant = "empty", visible = true }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trigger = () => inputRef.current?.click();

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-50 hidden items-center justify-center bg-background/80 backdrop-blur-sm",
          visible && "flex",
        )}
        aria-hidden={!visible}
      >
        <div className="rounded-lg border-2 border-dashed border-primary px-8 py-6 text-sm">
          Drop to load markdown file
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={trigger}
      className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/20 p-12 text-center transition-colors hover:border-muted-foreground/60 hover:bg-muted/30 min-h-[60vh]"
      aria-label="Upload markdown file"
    >
      <CloudUpload className="h-12 w-12 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-base font-medium">Drop a markdown file here</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
      </div>
      <p className="text-xs text-muted-foreground/70">.md, .markdown, .txt — max 5 MB</p>
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}
