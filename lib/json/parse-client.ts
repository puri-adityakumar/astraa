import type { ParseResult } from "./types";

type Pending = {
  id: number;
  resolve: (r: ParseResult) => void;
};

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
      return new Promise<ParseResult>((resolve) => {
        pending.set(id, { id, resolve });
        worker.postMessage({ id, text });
      });
    },
    destroy() {
      worker.terminate();
      pending.clear();
    },
  };
}
