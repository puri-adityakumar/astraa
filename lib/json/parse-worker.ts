/// <reference lib="webworker" />

import type { Diagnostic, JsonValue, ParseResult } from "./types";

type Request = { id: number; text: string };

function parse(req: Request): ParseResult {
  const start = performance.now();
  const bytes = new Blob([req.text]).size;
  if (req.text.trim() === "") {
    return {
      id: req.id,
      value: null,
      diagnostics: [],
      bytes,
      parseMs: 0,
    };
  }
  try {
    const value = JSON.parse(req.text) as JsonValue;
    return {
      id: req.id,
      value,
      diagnostics: [],
      bytes,
      parseMs: performance.now() - start,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const diag: Diagnostic = { severity: "error", message };
    const match = message.match(/position (\d+)/);
    if (match) {
      const pos = Number(match[1]);
      diag.bytePosition = pos;
      const upTo = req.text.slice(0, pos);
      diag.line = upTo.split("\n").length;
      const lastNl = upTo.lastIndexOf("\n");
      diag.column = lastNl === -1 ? pos + 1 : pos - lastNl;
    }
    return {
      id: req.id,
      value: null,
      diagnostics: [diag],
      bytes,
      parseMs: performance.now() - start,
    };
  }
}

self.addEventListener("message", (e: MessageEvent<Request>) => {
  const result = parse(e.data);
  self.postMessage(result);
});

export {};
