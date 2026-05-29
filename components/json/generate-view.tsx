"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Wand2, AlertCircle, Loader2 } from "lucide-react";
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

  const fmt = FORMATS.find((f) => f.id === generateFormat);
  const ext = fmt?.ext ?? "txt";

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
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            "inline-flex rounded-md border border-border/70",
            "bg-muted/40 p-0.5",
          )}
        >
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setGenerateFormat(f.id)}
              aria-pressed={generateFormat === f.id}
              className={cn(
                "px-3 py-1.5 rounded-sm min-h-touch",
                "font-mono text-[11px] uppercase tracking-wider",
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
        <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          <Wand2 className="h-3 w-3" aria-hidden />
          <span>
            JSON{"  →  "}
            <span className="text-foreground">Root.{ext}</span>
          </span>
        </div>
      </div>

      <CodeBlock variant={error ? "error" : "neutral"}>
        {error ? (
          <div className="flex items-start gap-2 p-4 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span className="text-xs font-mono">{error}</span>
          </div>
        ) : pending ? (
          <div className="flex items-center gap-2 p-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            <span className="text-xs font-mono">Generating…</span>
          </div>
        ) : (
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            placeholder="Output will appear here…"
            className={cn(
              "block w-full h-[50vh] p-4 resize-none outline-none",
              "bg-transparent font-mono text-xs leading-relaxed",
              "text-foreground placeholder:text-muted-foreground/40",
            )}
          />
        )}
      </CodeBlock>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={!output || pending}
          className="h-8 px-2.5 gap-1.5 text-xs"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={!output || pending}
          className="h-8 px-2.5 gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" aria-hidden /> Root.{ext}
        </Button>
      </div>
    </div>
  );
}

function CodeBlock({
  variant = "neutral",
  children,
}: {
  variant?: "neutral" | "error";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative rounded-md border overflow-hidden",
        variant === "error"
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/70 bg-muted/20",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 border-b border-border/40",
          "bg-muted/30",
        )}
      >
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
      </div>
      {children}
    </div>
  );
}
