import { runMatches } from "./match";
import type { MatchResult } from "./types";

export type SafeMatchResult = {
  results: MatchResult[];
  elapsedMs: number;
  timedOut: boolean;
  hardTimeout: boolean;
  capped: boolean;
};

export const DEFAULT_HARD_TIMEOUT_MS = 1500;

function fallbackSync(
  pattern: string,
  flags: string,
  input: string,
): SafeMatchResult {
  try {
    const regex = new RegExp(pattern, flags);
    const r = runMatches(regex, input);
    return {
      results: r.results,
      elapsedMs: r.elapsedMs,
      timedOut: r.timedOut,
      hardTimeout: false,
      capped: r.capped,
    };
  } catch {
    return {
      results: [],
      elapsedMs: 0,
      timedOut: false,
      hardTimeout: false,
      capped: false,
    };
  }
}

export async function runMatchesSafe(
  pattern: string,
  flags: string,
  input: string,
  hardTimeoutMs: number = DEFAULT_HARD_TIMEOUT_MS,
): Promise<SafeMatchResult> {
  if (typeof Worker === "undefined") {
    return fallbackSync(pattern, flags, input);
  }

  return new Promise((resolve) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./redos-worker.ts", import.meta.url), {
        type: "module",
      });
    } catch {
      resolve(fallbackSync(pattern, flags, input));
      return;
    }

    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve({
        results: [],
        elapsedMs: hardTimeoutMs,
        timedOut: true,
        hardTimeout: true,
        capped: false,
      });
    }, hardTimeoutMs);

    worker.onmessage = (event: MessageEvent) => {
      window.clearTimeout(timer);
      worker.terminate();
      const data = event.data as
        | {
            type: "done";
            results: MatchResult[];
            elapsedMs: number;
            capped: boolean;
          }
        | { type: "error"; error: string }
        | { type: "timeout" };

      if (data.type === "done") {
        resolve({
          results: data.results,
          elapsedMs: data.elapsedMs,
          timedOut: false,
          hardTimeout: false,
          capped: data.capped,
        });
      } else if (data.type === "timeout") {
        resolve({
          results: [],
          elapsedMs: hardTimeoutMs,
          timedOut: true,
          hardTimeout: true,
          capped: false,
        });
      } else {
        resolve(fallbackSync(pattern, flags, input));
      }
    };

    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(fallbackSync(pattern, flags, input));
    };

    worker.postMessage({ type: "run", pattern, flags, input });
  });
}
