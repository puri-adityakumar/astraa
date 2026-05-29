"use client";

import { useRef } from "react";
import { Sparkles, Minimize2, Wrench, ArrowDownAZ, Copy, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { repair } from "@/lib/json/repair";
import { validateFile, readFileAsText, MAX_DOCUMENT_BYTES } from "@/lib/json/validators";
import { logError } from "@/lib/error-handler";

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
      toast({ title: "Could not repair", description: r.error, variant: "destructive" });
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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={format}>
        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Format
      </Button>
      <Button size="sm" variant="outline" onClick={minify}>
        <Minimize2 className="h-3.5 w-3.5 mr-1.5" /> Minify
      </Button>
      <Button size="sm" variant="outline" onClick={onRepair}>
        <Wrench className="h-3.5 w-3.5 mr-1.5" /> Repair
      </Button>
      <Button size="sm" variant="outline" onClick={sortKeysAction}>
        <ArrowDownAZ className="h-3.5 w-3.5 mr-1.5" /> Sort keys
      </Button>
      <span className="mx-2 h-5 w-px bg-border" />
      <Button size="sm" variant="ghost" onClick={onCopy}>
        <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
      </Button>
      <Button size="sm" variant="ghost" onClick={onDownload}>
        <Download className="h-3.5 w-3.5 mr-1.5" /> Download
      </Button>
      <Button size="sm" variant="ghost" onClick={() => fileInput.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
      </Button>
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
