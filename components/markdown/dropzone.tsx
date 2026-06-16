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
        <div className="rounded-lg border-2 border-dashed border-border px-8 py-6 text-sm text-foreground">
          Drop to load markdown file
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={trigger}
      className="group flex w-full max-w-md flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card p-10 text-center transition-all hover:border-foreground/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Upload markdown file"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-foreground/10 group-hover:text-foreground">
        <CloudUpload className="h-6 w-6" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium">Drop a markdown file here</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
      </div>
      <p className="text-xs text-muted-foreground/70">.md, .markdown, .txt — up to 5 MB</p>
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
