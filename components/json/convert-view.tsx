"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, ArrowLeftRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { jsonToYaml, yamlToJson } from "@/lib/json/convert/yaml";
import { jsonToCsv, isCsvCompatible } from "@/lib/json/convert/csv";
import { jsonToMarkdown } from "@/lib/json/convert/markdown";
import { logError } from "@/lib/error-handler";
import type { ConvertFormat } from "@/lib/json/types";

const FORMATS: { id: ConvertFormat; label: string; ext: string }[] = [
  { id: "yaml", label: "YAML", ext: "yaml" },
  { id: "csv", label: "CSV", ext: "csv" },
  { id: "markdown", label: "Markdown", ext: "md" },
];

export function ConvertView() {
  const parsedValue = useJsonEditor((s) => s.parsedValue);
  const convertFormat = useJsonEditor((s) => s.convertFormat);
  const setConvertFormat = useJsonEditor((s) => s.setConvertFormat);
  const setText = useJsonEditor((s) => s.setText);
  const { toast } = useToast();
  const [output, setOutput] = useState("");
  const [yamlInput, setYamlInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (parsedValue === null) {
        if (!cancelled) {
          setError(null);
          setOutput("");
        }
        return;
      }
      setError(null);
      try {
        let out = "";
        if (convertFormat === "yaml") {
          out = await jsonToYaml(parsedValue);
        } else if (convertFormat === "csv") {
          if (!isCsvCompatible(parsedValue)) {
            setError("CSV requires an array of flat objects.");
            setOutput("");
            return;
          }
          out = await jsonToCsv(parsedValue);
        } else {
          out = jsonToMarkdown(parsedValue);
        }
        if (!cancelled) setOutput(out);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setOutput("");
          logError(e, { context: "json-editor/convert" });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parsedValue, convertFormat]);

  const ext = FORMATS.find((f) => f.id === convertFormat)?.ext ?? "txt";

  const onCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast({
      title: "Copied",
      description: `${convertFormat.toUpperCase()} copied.`,
    });
  };
  const onDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${ext}`;
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
              onClick={() => setConvertFormat(f.id)}
              aria-pressed={convertFormat === f.id}
              className={cn(
                "px-3 py-1.5 rounded-sm min-h-touch",
                "font-mono text-[11px] uppercase tracking-wider",
                "transition-colors duration-100 ease-out",
                convertFormat === f.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-mono uppercase tracking-wider text-muted-foreground">
          <ArrowLeftRight className="h-3 w-3" aria-hidden />
          <span>
            JSON{"  →  "}
            <span className="text-foreground">.{ext}</span>
          </span>
        </div>
      </div>

      <CodeBlock variant={error ? "error" : "neutral"}>
        {error ? (
          <div className="flex items-start gap-2 p-4 text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span className="text-xs font-mono">{error}</span>
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
          disabled={!output}
          className="h-8 px-2.5 gap-1.5 text-xs"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={!output}
          className="h-8 px-2.5 gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" aria-hidden /> data.{ext}
        </Button>
      </div>

      {convertFormat === "yaml" && (
        <div className="space-y-2 pt-2 border-t border-border/60">
          <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Or paste YAML to import →
          </p>
          <CodeBlock variant="neutral">
            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              placeholder="key: value"
              spellCheck={false}
              className={cn(
                "block w-full h-32 p-4 resize-none outline-none",
                "bg-transparent font-mono text-xs leading-relaxed",
                "text-foreground placeholder:text-muted-foreground/40",
              )}
            />
          </CodeBlock>
          <Button
            size="sm"
            onClick={async () => {
              const r = await yamlToJson(yamlInput);
              if (r.ok) {
                setText(JSON.stringify(r.value, null, 2));
                toast({ title: "YAML imported" });
              } else {
                toast({
                  title: "Invalid YAML",
                  description: r.error,
                  variant: "destructive",
                });
              }
            }}
            disabled={!yamlInput.trim()}
            className="h-8 px-2.5 text-xs"
          >
            Import YAML
          </Button>
        </div>
      )}
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
      {/* Faux window dots */}
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
