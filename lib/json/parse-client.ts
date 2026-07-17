import type { Diagnostic, ParseResult } from "./types";
import { MAX_DOCUMENT_BYTES } from "./defaults";

type Pending = {
  id: number;
  resolve: (r: ParseResult) => void;
  reject: (e: unknown) => void;
};

/**
 * Build an AbortError, using DOMException when available (Node 18+ and all
 * modern browsers) and falling back to a plain Error otherwise so the result
 * is always testable via `e.name === "AbortError"`.
 */
export function createAbortError(message: string): Error {
  if (typeof DOMException !== "undefined") {
    return new DOMException(message, "AbortError");
  }
  const err = new Error(message);
  err.name = "AbortError";
  return err;
}

export type ParseClient = {
  parse: (text: string) => Promise<ParseResult>;
  destroy: () => void;
};

export function createParseClient(worker: Worker): ParseClient {
  let nextId = 1;
  let latestId = 0;
  const pending = new Map<number, Pending>();

  worker.onmessage = (e: MessageEvent<ParseResult>) => {
    const result = e.data;
    const entry = pending.get(result.id);
    if (!entry) return;
    pending.delete(result.id);
    if (result.id !== latestId) {
      entry.resolve({ ...result, value: null });
      return;
    }
    entry.resolve(result);
  };

  return {
    parse(text: string) {
      const id = nextId++;
      latestId = id;
      return new Promise<ParseResult>((resolve, reject) => {
        pending.set(id, { id, resolve, reject });

        // Guard the parse ingress: cap the payload size at the worker boundary
        // (same limit as file upload) so an oversized text input — pasted or
        // typed — never reaches the worker. Resolves with a diagnostic rather
        // than rejecting, matching the worker's own error shape.
        const bytes = new Blob([text]).size;
        if (bytes > MAX_DOCUMENT_BYTES) {
          const diag: Diagnostic = {
            severity: "error",
            message: `Document exceeds the ${Math.round(
              MAX_DOCUMENT_BYTES / 1024 / 1024,
            )} MB limit (${bytes} bytes).`,
          };
          pending.delete(id);
          resolve({ id, value: null, diagnostics: [diag], bytes, parseMs: 0 });
          return;
        }

        worker.postMessage({ id, text });
      });
    },
    destroy() {
      // Reject every in-flight parse first, so no `await client.parse(...)` is
      // abandoned forever after the worker is torn down.
      for (const p of pending.values()) {
        p.reject(createAbortError("ParseClient destroyed"));
      }
      worker.terminate();
      pending.clear();
    },
  };
}
