"use client";

import { useEffect, useRef } from "react";
import {
  Sparkles,
  Minimize2,
  Wrench,
  ArrowDownAZ,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { repair } from "@/lib/json/repair";
import {
  validateFile,
  readFileAsText,
  MAX_DOCUMENT_BYTES,
} from "@/lib/json/validators";
import { logError } from "@/lib/error-handler";

type ToolButtonProps = {
  label: string;
  kbd?: string;
  Icon: typeof Sparkles;
  variant?: "primary" | "outline" | "ghost";
  onClick: () => void;
};

function ToolButton({
  label,
  kbd,
  Icon,
  variant = "outline",
  onClick,
}: ToolButtonProps) {
  return (
    <Button
      size="sm"
      variant={
        variant === "primary" ? "default" : variant === "outline" ? "outline" : "ghost"
      }
      onClick={onClick}
      className={cn(
        "h-8 px-2.5 gap-1.5 text-xs font-medium",
        "transition-colors duration-100 ease-out",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{label}</span>
      {kbd && (
        <kbd
          className={cn(
            "ml-0.5 hidden md:inline-flex items-center px-1 h-4 rounded-[3px]",
            "bg-muted text-[9.5px] font-mono text-muted-foreground/80",
            "border border-border/60",
          )}
        >
          {kbd}
        </kbd>
      )}
    </Button>
  );
}

export function Toolbar() {
  const text = useJsonEditor((s) => s.text);
  const filename = useJsonEditor((s) => s.filename);
  const format = useJsonEditor((s) => s.format);
  const minify = useJsonEditor((s) => s.minify);
  const sortKeysAction = useJsonEditor((s) => s.sortKeysAction);
  const setText = useJsonEditor((s) => s.setText);
  const { toast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const onRepair = async () => {
    const r = await repair(text);
    if (r.ok) {
      setText(r.text);
      toast({ title: "Repaired", description: "JSON cleaned up." });
    } else {
      toast({
        title: "Could not repair",
        description: r.error,
        variant: "destructive",
      });
    }
  };

  const onCopy = async () => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  const onDownload = () => {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const onUpload = async (file: File) => {
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
    } catch (e) {
      logError(e, { context: "json-editor/upload" });
      toast({ title: "Upload failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.shiftKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        format();
      } else if (key === "m") {
        e.preventDefault();
        minify();
      } else if (key === "r") {
        e.preventDefault();
        void onRepair();
      } else if (key === "k") {
        e.preventDefault();
        sortKeysAction();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, minify, sortKeysAction, text]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-1.5 rounded-md border border-border/70",
        "bg-muted/30 backdrop-blur-sm",
      )}
      role="toolbar"
      aria-label="JSON Editor actions"
    >
      <div className="flex flex-wrap items-center gap-1">
        <ToolButton
          variant="primary"
          label="Format"
          kbd="⌘S"
          Icon={Sparkles}
          onClick={format}
        />
        <ToolButton
          label="Minify"
          kbd="⌘M"
          Icon={Minimize2}
          onClick={minify}
        />
        <ToolButton
          label="Repair"
          kbd="⌘R"
          Icon={Wrench}
          onClick={onRepair}
        />
        <ToolButton
          label="Sort"
          kbd="⌘K"
          Icon={ArrowDownAZ}
          onClick={sortKeysAction}
        />
      </div>
      <span
        className="hidden sm:inline-block mx-1 h-5 w-px bg-border/60"
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-1">
        <ToolButton
          variant="ghost"
          label="Copy"
          Icon={Copy}
          onClick={onCopy}
        />
        <ToolButton
          variant="ghost"
          label="Download"
          Icon={Download}
          onClick={onDownload}
        />
        <ToolButton
          variant="ghost"
          label="Upload"
          Icon={Upload}
          onClick={() => fileInput.current?.click()}
        />
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json,text/plain"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
