import type { ParseResult } from "./types";

type Pending = {
  resolve: (r: ParseResult | null) => void;
  reject: (error: Error) => void;
};

export type ParseClient = {
  parse: (text: string) => Promise<ParseResult | null>;
  destroy: () => void;
};

export function createParseClient(worker: Worker): ParseClient {
  let nextId = 1;
  let latestId = 0;
  let destroyed = false;
  const pending = new Map<number, Pending>();

  worker.onmessage = (e: MessageEvent<ParseResult>) => {
    const result = e.data;
    const entry = pending.get(result.id);
    if (!entry) return;
    pending.delete(result.id);
    if (result.id !== latestId) {
      entry.resolve(null);
      return;
    }
    entry.resolve(result);
  };

  worker.onerror = () => {
    for (const entry of pending.values()) {
      entry.reject(new Error("JSON parser worker failed"));
    }
    pending.clear();
  };

  return {
    parse(text: string) {
      if (destroyed) return Promise.resolve(null);
      for (const entry of pending.values()) entry.resolve(null);
      pending.clear();
      const id = nextId++;
      latestId = id;
      return new Promise<ParseResult | null>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        try {
          worker.postMessage({ id, text });
        } catch (error) {
          pending.delete(id);
          reject(error);
        }
      });
    },
    destroy() {
      destroyed = true;
      worker.terminate();
      for (const entry of pending.values()) entry.resolve(null);
      pending.clear();
      worker.onmessage = null;
      worker.onerror = null;
    },
  };
}
