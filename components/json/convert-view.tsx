"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { jsonToYaml, yamlToJson } from "@/lib/json/convert/yaml";
import { jsonToCsv, isCsvCompatible } from "@/lib/json/convert/csv";
import { jsonToMarkdown } from "@/lib/json/convert/markdown";
import { logError } from "@/lib/error-handler";
import type { ConvertFormat } from "@/lib/json/types";

const FORMATS: { id: ConvertFormat; label: string }[] = [
  { id: "yaml", label: "YAML" },
  { id: "csv", label: "CSV" },
  { id: "markdown", label: "Markdown" },
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

  const onCopy = async () => {
    await navigator.clipboard.writeText(output);
    toast({ title: "Copied", description: `${convertFormat.toUpperCase()} copied.` });
  };
  const onDownload = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data.${convertFormat === "markdown" ? "md" : convertFormat}`;
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
            onClick={() => setConvertFormat(f.id)}
            aria-pressed={convertFormat === f.id}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-sm min-h-touch",
              "transition-colors duration-100 ease-out",
              convertFormat === f.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {error ? (
        <div
          className={cn(
            "p-3 text-sm rounded-md border",
            "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {error}
        </div>
      ) : (
        <textarea
          readOnly
          value={output}
          className="w-full h-[50vh] p-3 font-mono text-xs border rounded-md bg-muted/30"
        />
      )}
      {convertFormat === "yaml" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Or paste YAML to convert into JSON:
          </p>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            placeholder="key: value"
            className="w-full h-32 p-3 font-mono text-xs border rounded-md bg-background"
          />
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
          >
            Import YAML
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCopy} disabled={!output}>
          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} disabled={!output}>
          <Download className="h-3.5 w-3.5 mr-1.5" /> Download
        </Button>
      </div>
    </div>
  );
}
