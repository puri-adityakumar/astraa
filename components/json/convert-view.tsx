"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { jsonToYaml, yamlToJson } from "@/lib/json/convert/yaml";
import { jsonToCsv, isCsvCompatible } from "@/lib/json/convert/csv";
import { jsonToMarkdown } from "@/lib/json/convert/markdown";
import { downloadContent } from "@/lib/download";
import { logError } from "@/lib/error-handler";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { OutputPanel } from "@/components/json/output-panel";
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
  const copy = useCopyToClipboard();
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
    await copy(output, `${convertFormat.toUpperCase()} copied`);
  };
  const onDownload = () => {
    downloadContent(output, `data.${ext}`, "text/plain");
  };

  return (
    <div className="space-y-3">
      <OutputPanel
        formats={FORMATS}
        format={convertFormat}
        onFormatChange={(id) => setConvertFormat(id as ConvertFormat)}
        output={output}
        error={error}
        onCopy={onCopy}
        onDownload={onDownload}
      />

      {convertFormat === "yaml" && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm text-muted-foreground">Or paste YAML to convert into JSON:</p>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            placeholder="key: value"
            className={cn("w-full h-32 p-3 rounded-md border bg-background", "font-mono text-xs")}
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
            disabled={!yamlInput.trim()}
          >
            Import YAML
          </Button>
        </div>
      )}
    </div>
  );
}
