"use client";

import { useEffect, useState } from "react";
import { Copy, Download, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { generateTypeScript } from "@/lib/json/generate/typescript";
import { generateZod } from "@/lib/json/generate/zod";
import { generateJsonSchema } from "@/lib/json/generate/json-schema";
import { logError } from "@/lib/error-handler";
import type { GenerateFormat } from "@/lib/json/types";

const FORMATS: { id: GenerateFormat; label: string; ext: string }[] = [
  { id: "typescript", label: "TypeScript", ext: "ts" },
  { id: "zod", label: "Zod", ext: "ts" },
  { id: "json-schema", label: "JSON Schema", ext: "json" },
];

export function GenerateView() {
  const text = useJsonEditor((s) => s.text);
  const parsedValue = useJsonEditor((s) => s.parsedValue);
  const generateFormat = useJsonEditor((s) => s.generateFormat);
  const setGenerateFormat = useJsonEditor((s) => s.setGenerateFormat);
  const { toast } = useToast();
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setPending(true);
      try {
        let out = "";
        if (parsedValue === null) {
          setOutput("");
          return;
        }
        if (generateFormat === "typescript") {
          out = await generateTypeScript(text, "Root");
        } else if (generateFormat === "zod") {
          out = await generateZod(text, "Root");
        } else {
          out = JSON.stringify(generateJsonSchema(parsedValue), null, 2);
        }
        if (!cancelled) setOutput(out);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          logError(e, { context: "json-editor/generate" });
        }
      } finally {
        if (!cancelled) setPending(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, parsedValue, generateFormat]);

  const ext = FORMATS.find((f) => f.id === generateFormat)?.ext ?? "txt";

  const onCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast({ title: "Copied" });
  };
  const onDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Root.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md border bg-muted p-0.5">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            onClick={() => setGenerateFormat(f.id)}
            aria-pressed={generateFormat === f.id}
            className={cn(
              "px-3 py-1.5 text-sm rounded-sm min-h-touch",
              "transition-colors duration-100 ease-out",
              generateFormat === f.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          className={cn(
            "flex items-start gap-2 p-3 rounded-md border",
            "border-destructive/40 bg-destructive/10 text-destructive text-sm",
          )}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      ) : pending ? (
        <div
          className={cn(
            "flex items-center gap-2 h-[50vh] p-3 rounded-md border",
            "bg-muted/30 text-sm text-muted-foreground",
          )}
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>Generating…</span>
        </div>
      ) : (
        <textarea
          readOnly
          value={output}
          spellCheck={false}
          placeholder="Output will appear here…"
          className={cn(
            "w-full h-[50vh] p-3 rounded-md border bg-muted/30",
            "font-mono text-xs",
          )}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={!output || pending}
        >
          <Copy className="h-4 w-4 mr-2" aria-hidden /> Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={!output || pending}
        >
          <Download className="h-4 w-4 mr-2" aria-hidden /> Download
        </Button>
      </div>
    </div>
  );
}
