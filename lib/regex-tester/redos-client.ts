import type { RunMatchesResult } from "./match";
import type { ReplaceResult } from "./replace";
import type { MiniTestResult } from "./tests-runner";
import type { MiniTest } from "./types";
import type { RegexWorkerRequest, RegexWorkerResponse } from "./redos-protocol";

export type SafeMatchResult = RunMatchesResult & { hardTimeout: boolean };

export const DEFAULT_HARD_TIMEOUT_MS = 1500;
export const HARD_TIMEOUT_MESSAGE = "Pattern hangs — simplify";

class HardTimeoutError extends Error {
  constructor() {
    super(HARD_TIMEOUT_MESSAGE);
  }
}

function runWorker<T>(
  request: RegexWorkerRequest,
  hardTimeoutMs: number,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Cancelled", "AbortError"));
      return;
    }
    if (typeof Worker === "undefined") {
      reject(new Error("Web Workers are unavailable. Regex execution is disabled for safety."));
      return;
    }
    let worker: Worker;
    try {
      worker = new Worker(new URL("./redos-worker.ts", import.meta.url), { type: "module" });
    } catch {
      reject(new Error("Could not start a Web Worker. Regex execution is disabled for safety."));
      return;
    }

    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
    };
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => fail(new DOMException("Cancelled", "AbortError"));
    const timer = setTimeout(() => fail(new HardTimeoutError()), hardTimeoutMs);
    signal?.addEventListener("abort", onAbort, { once: true });
    worker.onmessage = (event: MessageEvent<RegexWorkerResponse>) => {
      if (event.data.type === "error") {
        fail(new Error(event.data.error));
        return;
      }
      if (settled) return;
      settled = true;
      cleanup();
      resolve(event.data.result as T);
    };
    worker.onerror = () => fail(new Error("Regex worker failed. Please try again."));
    try {
      worker.postMessage(request);
    } catch (error) {
      fail(error);
    }
  });
}

export async function runMatchesSafe(
  pattern: string,
  flags: string,
  input: string,
  hardTimeoutMs: number = DEFAULT_HARD_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<SafeMatchResult> {
  try {
    const result = await runWorker<RunMatchesResult>(
      { type: "run", pattern, flags, input },
      hardTimeoutMs,
      signal,
    );
    return { ...result, hardTimeout: false };
  } catch (error) {
    if (!(error instanceof HardTimeoutError)) throw error;
    return {
      results: [],
      elapsedMs: hardTimeoutMs,
      timedOut: true,
      hardTimeout: true,
      capped: false,
    };
  }
}

export function runReplaceSafe(
  pattern: string,
  flags: string,
  input: string,
  replacement: string,
  signal?: AbortSignal,
): Promise<ReplaceResult> {
  return runWorker(
    { type: "replace", pattern, flags, input, replacement },
    DEFAULT_HARD_TIMEOUT_MS,
    signal,
  );
}

export function runMiniTestsSafe(
  pattern: string,
  flags: string,
  tests: MiniTest[],
  signal?: AbortSignal,
): Promise<MiniTestResult[]> {
  return runWorker({ type: "tests", pattern, flags, tests }, DEFAULT_HARD_TIMEOUT_MS, signal);
}
