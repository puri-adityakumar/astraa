"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { validateFile, readFileAsText, MAX_DOCUMENT_BYTES } from "@/lib/json/validators";
import { logError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";

export function DropzoneOverlay() {
  const setText = useJsonEditor((s) => s.setText);
  const { toast } = useToast();
  const [over, setOver] = useState(false);

  useEffect(() => {
    let depth = 0;
    const isFile = (e: DragEvent) =>
      !!e.dataTransfer && Array.from(e.dataTransfer.types).includes("Files");

    const onEnter = (e: DragEvent) => {
      if (!isFile(e)) return;
      depth++;
      setOver(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!isFile(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setOver(false);
    };
    const onOver = (e: DragEvent) => {
      if (isFile(e)) e.preventDefault();
    };
    const onDrop = async (e: DragEvent) => {
      if (!isFile(e)) return;
      e.preventDefault();
      depth = 0;
      setOver(false);
      const file = e.dataTransfer?.files[0];
      if (!file) return;
      const check = validateFile(file);
      if (!check.ok) {
        toast({
          title: "File rejected",
          description:
            check.reason === "size"
              ? `Max ${Math.round(MAX_DOCUMENT_BYTES / 1024 / 1024)} MB.`
              : "Only .json files supported.",
          variant: "destructive",
        });
        return;
      }
      try {
        const content = await readFileAsText(file);
        setText(content);
        toast({ title: "Loaded", description: file.name });
      } catch (err) {
        logError(err, { context: "json-editor/dropzone" });
        toast({ title: "Drop failed", variant: "destructive" });
      }
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [setText, toast]);

  if (!over) return null;
  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm",
        "flex items-center justify-center pointer-events-none",
      )}
    >
      <div
        className={cn(
          "rounded-xl border-2 border-dashed border-primary",
          "bg-background/95 px-8 py-6 text-center",
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
        <p className="text-sm font-medium">Drop to open</p>
        <p className="text-xs text-muted-foreground">.json file · up to 50 MB</p>
      </div>
    </div>
  );
}
