"use client";

import { useEffect, useState } from "react";
import { useJsonEditor } from "@/lib/stores/json-editor";
import { generateTypeScript } from "@/lib/json/generate/typescript";
import { generateZod } from "@/lib/json/generate/zod";
import { generateJsonSchema } from "@/lib/json/generate/json-schema";
import { downloadContent } from "@/lib/download";
import { logError } from "@/lib/error-handler";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { OutputPanel } from "@/components/json/output-panel";
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
  const copy = useCopyToClipboard();
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
    await copy(output);
  };
  const onDownload = () => {
    downloadContent(output, `Root.${ext}`, "text/plain");
  };

  return (
    <OutputPanel
      formats={FORMATS}
      format={generateFormat}
      onFormatChange={(id) => setGenerateFormat(id as GenerateFormat)}
      output={output}
      error={error}
      onCopy={onCopy}
      onDownload={onDownload}
      pending={pending}
    />
  );
}
