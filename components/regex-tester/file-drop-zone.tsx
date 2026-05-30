"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export const MAX_DROP_BYTES = 100 * 1024;

export const DROP_ACCEPT = [
  ".txt",
  ".log",
  ".csv",
  ".json",
  ".md",
  ".html",
] as const;

export interface FileDropZoneProps {
  onText: (text: string) => void;
  className?: string;
}

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return DROP_ACCEPT.some((ext) => lower.endsWith(ext));
}

export function FileDropZone({ onText, className }: FileDropZoneProps) {
  const [active, setActive] = useState(false);
  const dragDepthRef = useRef(0);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      e.dataTransfer.types.includes("Files") ||
      e.dataTransfer.types.includes("application/x-moz-file")
    ) {
      dragDepthRef.current += 1;
      setActive(true);
    }
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

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!hasAcceptedExtension(file.name)) {
        toast({
          title: "Unsupported file",
          description: "Drop a .txt, .log, .csv, .json, .md, or .html file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > MAX_DROP_BYTES) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than the 100 KB test-string limit.`,
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") return;
        onText(result);
        toast({
          title: "File loaded",
          description: `${file.name} pasted into the test string.`,
        });
      };
      reader.onerror = () => {
        toast({
          title: "Could not read file",
          description: reader.error?.message ?? "Unknown error",
          variant: "destructive",
        });
      };
      reader.readAsText(file);
    },
    [onText, toast],
  );

  // Safety: if the user drops outside the window the drag state can stick.
  useEffect(() => {
    const reset = () => {
      dragDepthRef.current = 0;
      setActive(false);
    };
    window.addEventListener("dragend", reset);
    window.addEventListener("drop", reset);
    return () => {
      window.removeEventListener("dragend", reset);
      window.removeEventListener("drop", reset);
    };
  }, []);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn("absolute inset-0", className)}
      aria-hidden={!active}
    >
      {active && (
        <div
          className={cn(
            "absolute inset-0 z-10 flex items-center justify-center",
            "rounded-md border-2 border-dashed border-primary",
            "bg-primary/5 backdrop-blur-sm",
            "text-sm font-medium text-primary",
            "pointer-events-none",
          )}
        >
          <span className="inline-flex items-center gap-2">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Drop to load as test string
          </span>
        </div>
      )}
    </div>
  );
}
