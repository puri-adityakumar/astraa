import type { ParseResult } from "./types";

type Pending = {
  resolve: (r: ParseResult | null) => void;
  reject: (error: Error) => void;
};

export type ParseClient = {
  parse: (text: string) => Promise<ParseResult | null>;
  destroy: () => void;
};

const WORKER_FAILED = "JSON parser worker failed";

export function createParseClient(worker: Worker): ParseClient {
  let nextId = 1;
  let latestId = 0;
  let destroyed = false;
  let failed = false;
  const pending = new Map<number, Pending>();

  function settlePending() {
    for (const entry of pending.values()) entry.resolve(null);
    pending.clear();
  }

  function detach() {
    worker.onmessage = null;
    worker.onerror = null;
  }

  function release() {
    detach();
    try {
      worker.terminate();
    } catch {
      // The worker is already gone; callers have nothing left to release.
    }
  }

  function fail(error: Error) {
    failed = true;
    for (const entry of pending.values()) entry.reject(error);
    pending.clear();
    release();
  }

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
    fail(new Error(WORKER_FAILED));
  };

  return {
    parse(text: string) {
      if (destroyed) return Promise.resolve(null);
      if (failed) return Promise.reject(new Error(WORKER_FAILED));
      settlePending();
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
      if (destroyed) return;
      destroyed = true;
      settlePending();
      release();
    },
  };
}
