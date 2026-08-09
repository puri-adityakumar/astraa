import type { MatchResult } from "./types";

export type SafeMatchStatus = "idle" | "success" | "timed-out" | "unavailable" | "cancelled";

export interface SafeMatchResult {
  status: SafeMatchStatus;
  results: MatchResult[];
  elapsedMs: number;
  timedOut: boolean;
  hardTimeout: boolean;
  capped: boolean;
  replacementResult: string;
  replacementError: string | null;
}

export interface SafeMatchOptions {
  replacement?: string;
  hardTimeoutMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_HARD_TIMEOUT_MS = 1_500;

export function runMatchesSafe(
  pattern: string,
  flags: string,
  input: string,
  options: SafeMatchOptions = {},
): Promise<SafeMatchResult> {
  const hardTimeoutMs = options.hardTimeoutMs ?? DEFAULT_HARD_TIMEOUT_MS;
  const replacement = options.replacement ?? "";

  if (options.signal?.aborted) {
    return Promise.resolve(createEmptyResult("cancelled"));
  }

  if (typeof Worker === "undefined") {
    return Promise.resolve(createEmptyResult("unavailable"));
  }

  return new Promise((resolve) => {
    let settled = false;
    let worker: Worker;

    const finish = (result: SafeMatchResult): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      options.signal?.removeEventListener("abort", handleAbort);
      worker.terminate();
      resolve(result);
    };

    const handleAbort = (): void => finish(createEmptyResult("cancelled"));

    try {
      worker = new Worker(new URL("./redos-worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      resolve(createEmptyResult("unavailable"));
      return;
    }

    const timer = window.setTimeout(() => {
      finish({
        ...createEmptyResult("timed-out"),
        elapsedMs: hardTimeoutMs,
        timedOut: true,
        hardTimeout: true,
      });
    }, hardTimeoutMs);

    options.signal?.addEventListener("abort", handleAbort, { once: true });

    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as
        | {
            type: "done";
            results: MatchResult[];
            elapsedMs: number;
            capped: boolean;
            replacementResult: string;
          }
        | { type: "error" }
        | { type: "timeout" };

      if (data.type === "done") {
        finish({
          status: "success",
          results: data.results,
          elapsedMs: data.elapsedMs,
          timedOut: false,
          hardTimeout: false,
          capped: data.capped,
          replacementResult: data.replacementResult,
          replacementError: null,
        });
        return;
      }

      finish(createEmptyResult(data.type === "timeout" ? "timed-out" : "unavailable"));
    };

    worker.onerror = () => finish(createEmptyResult("unavailable"));
    worker.postMessage({ type: "run", pattern, flags, input, replacement });
  });
}

export function createEmptyResult(status: SafeMatchStatus): SafeMatchResult {
  const timedOut = status === "timed-out";
  return {
    status,
    results: [],
    elapsedMs: 0,
    timedOut,
    hardTimeout: timedOut,
    capped: false,
    replacementResult: "",
    replacementError: null,
  };
}
