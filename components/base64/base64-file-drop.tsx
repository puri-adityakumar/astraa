"use client";

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  FileTooLargeError,
  MAX_FILE_BYTES,
  readFileAsBytes,
} from "@/lib/base64";
import { getUserFriendlyError, logError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";

export interface Base64FileDropProps {
  file: { name: string; bytes: Uint8Array } | null;
  onFile: (file: { name: string; bytes: Uint8Array } | null) => void;
}

const MAX_MB = MAX_FILE_BYTES / 1024 / 1024;

export function Base64FileDrop({ file, onFile }: Base64FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const dragDepthRef = useRef(0);
  const { toast } = useToast();

  const ingest = useCallback(
    async (raw: File) => {
      try {
        const bytes = await readFileAsBytes(raw);
        onFile({ name: raw.name, bytes });
      } catch (error) {
        if (error instanceof FileTooLargeError) {
          toast({
            title: "File too large",
            description: error.message,
            variant: "destructive",
          });
        } else {
          const details = getUserFriendlyError(error);
          toast({
            title: details.title,
            description: details.message,
            variant: "destructive",
          });
          logError(error, { context: "base64/file-drop" });
        }
      }
    },
    [onFile, toast],
  );

  const handleSelect = useCallback(() => inputRef.current?.click(), []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepthRef.current += 1;
    setActive(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setActive(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthRef.current = 0;
      setActive(false);
      const dropped = e.dataTransfer.files[0];
      if (!dropped) return;
      void ingest(dropped);
    },
    [ingest],
  );

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        aria-label="Upload a file (tap or drag)"
        aria-describedby="base64-file-help"
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-8 px-4",
          "rounded-md border-2 border-dashed text-sm text-center",
          "transition-colors duration-100 ease-out cursor-pointer min-h-touch",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          active
            ? "border-primary bg-primary/5 text-primary"
            : "border-input bg-muted/20 text-muted-foreground hover:bg-muted/40",
        )}
      >
        <Upload className="h-5 w-5" aria-hidden="true" />
        <span className="font-medium text-foreground">
          {active ? "Drop to load" : "Tap to upload or drag a file"}
        </span>
        <span id="base64-file-help" className="text-xs">
          Max {MAX_MB.toFixed(0)} MB · processed locally
        </span>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) void ingest(selected);
            e.target.value = "";
          }}
        />
      </div>

      {file && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <span className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate font-mono text-xs">{file.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {(file.bytes.length / 1024).toFixed(1)} KB
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onFile(null)}
            aria-label="Clear loaded file"
            className="min-h-touch min-w-touch"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
