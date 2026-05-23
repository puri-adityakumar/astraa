"use client";

import { useEffect, useRef, useState } from "react";
import { highlight } from "@/lib/snippet-generator/highlight";
import { validateCodeLength } from "@/lib/snippet-generator/validators";
import { useToast } from "@/components/ui/use-toast";
import { logError } from "@/lib/error-handler";
import type { HighlightResult } from "@/lib/snippet-generator/types";

type Props = {
  code: string;
  language: string;
  theme: string;
  fontFamily: string;
  fontSize: number;
  padding: number;
  lineNumbers: boolean;
  onChange: (next: string) => void;
};

export function CodePreview({
  code,
  language,
  theme,
  fontFamily,
  fontSize,
  padding,
  lineNumbers,
  onChange,
}: Props) {
  const [result, setResult] = useState<HighlightResult | null>(null);
  const debounce = useRef<number | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      highlight(code, language, theme)
        .then(setResult)
        .catch((e) => {
          logError(e, { context: "snippet-generator/highlight" });
          setResult({
            lines: code.split("\n").map((line) => [{ content: line }]),
            bg: "#0d1117",
            fg: "#e6edf3",
          });
        });
    }, 150);
    return () => window.clearTimeout(debounce.current);
  }, [code, language, theme]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    const check = validateCodeLength(v);
    if (!check.ok) {
      toast({
        title: "Code too large",
        description: "Maximum 100 KB.",
        variant: "destructive",
      });
      return;
    }
    onChange(v);
  };

  const lineCount = code.split("\n").length;
  const bg = result?.bg ?? "#0d1117";
  const fg = result?.fg ?? "#e6edf3";

  return (
    <div
      className="relative font-mono"
      style={{ fontFamily, fontSize, padding, background: bg, color: fg }}
    >
      {lineNumbers && (
        <div
          className="absolute left-0 top-0 text-right text-zinc-500 select-none"
          style={{ padding, paddingRight: 8, fontSize, width: 48 }}
          aria-hidden
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}
      <pre
        className="relative m-0 whitespace-pre"
        style={{ paddingLeft: lineNumbers ? 56 : 0 }}
      >
        {result
          ? result.lines.map((line, i) => (
              <div key={i}>
                {line.length === 0 ? " " : line.map((t, j) => (
                  <span key={j} style={t.color ? { color: t.color } : undefined}>
                    {t.content}
                  </span>
                ))}
              </div>
            ))
          : code.split("\n").map((line, i) => (
              <div key={i}>{line.length === 0 ? " " : line}</div>
            ))}
      </pre>
      <textarea
        value={code}
        onChange={handleChange}
        spellCheck={false}
        aria-label="Code editor"
        className={
          "absolute inset-0 w-full h-full resize-none bg-transparent " +
          "text-transparent caret-white outline-none whitespace-pre"
        }
        style={{
          fontFamily,
          fontSize,
          padding,
          paddingLeft: lineNumbers ? padding + 56 : padding,
        }}
      />
    </div>
  );
}
