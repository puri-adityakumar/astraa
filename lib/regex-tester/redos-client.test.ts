import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runMatchesSafe, runMiniTestsSafe, runReplaceSafe } from "./redos-client";
import type { RegexWorkerRequest, RegexWorkerResponse } from "./redos-protocol";

class MockWorker {
  static instances: MockWorker[] = [];
  onmessage: ((event: MessageEvent<RegexWorkerResponse>) => void) | null = null;
  onerror: (() => void) | null = null;
  postMessage = vi.fn<(request: RegexWorkerRequest) => void>();
  terminate = vi.fn();

  constructor() {
    MockWorker.instances.push(this);
  }

  respond(data: RegexWorkerResponse): void {
    this.onmessage?.({ data } as MessageEvent<RegexWorkerResponse>);
  }
}

function lastWorker(): MockWorker {
  const worker = MockWorker.instances.at(-1);
  if (!worker) throw new Error("Expected a worker");
  return worker;
}

beforeEach(() => {
  vi.useFakeTimers();
  MockWorker.instances = [];
  vi.stubGlobal("Worker", MockWorker);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("safe regex workers", () => {
  it("runs matching only in a worker and preserves the soft time budget result", async () => {
    const pending = runMatchesSafe("a", "g", "a");
    const worker = lastWorker();
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: "run", pattern: "a", flags: "g", input: "a",
    });
    worker.respond({
      type: "done",
      result: { results: [], elapsedMs: 251, capped: false, timedOut: true },
    });
    await expect(pending).resolves.toEqual({
      results: [], elapsedMs: 251, capped: false, timedOut: true, hardTimeout: false,
    });
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("terminates a hung worker at the hard deadline", async () => {
    const pending = runMatchesSafe("^(a+)+$", "", "a".repeat(30) + "b", 50);
    const worker = lastWorker();
    await vi.advanceTimersByTimeAsync(50);
    await expect(pending).resolves.toMatchObject({ hardTimeout: true, timedOut: true });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("cancels obsolete requests and ignores their later replies", async () => {
    const controller = new AbortController();
    const old = runMatchesSafe("a", "", "a", 50, controller.signal);
    const oldWorker = lastWorker();
    const cancelled = expect(old).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await cancelled;
    const latest = runMatchesSafe("b", "", "b");
    oldWorker.respond({
      type: "done",
      result: { results: [], elapsedMs: 10, capped: false, timedOut: false },
    });
    lastWorker().respond({
      type: "done",
      result: { results: [], elapsedMs: 1, capped: false, timedOut: false },
    });
    await expect(latest).resolves.toMatchObject({ elapsedMs: 1 });
    expect(oldWorker.terminate).toHaveBeenCalledOnce();
  });

  it("never executes synchronously when workers are unavailable", async () => {
    vi.stubGlobal("Worker", undefined);
    await expect(runMatchesSafe("^(a+)+$", "", "a".repeat(30) + "b")).rejects.toThrow(
      "disabled for safety",
    );
  });

  it("does not fall back to the main thread after a startup failure", async () => {
    vi.stubGlobal("Worker", class {
      constructor() { throw new Error("blocked"); }
    });
    await expect(runMatchesSafe("a", "", "a")).rejects.toThrow("disabled for safety");
  });

  it("does not fall back after a worker error", async () => {
    const pending = runMatchesSafe("a", "", "a");
    lastWorker().onerror?.();
    await expect(pending).rejects.toThrow("Regex worker failed");
    expect(lastWorker().terminate).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("surfaces worker-reported errors without retrying on the main thread", async () => {
    const pending = runMatchesSafe("[", "", "a");
    lastWorker().respond({ type: "error", error: "Invalid pattern" });
    await expect(pending).rejects.toThrow("Invalid pattern");
  });

  it("routes replacement through the same bounded worker", async () => {
    const pending = runReplaceSafe("a", "g", "aa", "b");
    expect(lastWorker().postMessage).toHaveBeenCalledWith({
      type: "replace", pattern: "a", flags: "g", input: "aa", replacement: "b",
    });
    lastWorker().respond({ type: "done", result: { ok: true, result: "bb" } });
    await expect(pending).resolves.toEqual({ ok: true, result: "bb" });
  });

  it("bounds replacement and mini-tests with hard timeouts too", async () => {
    const replacement = expect(runReplaceSafe("a", "", "a", "b")).rejects.toThrow(
      "Pattern hangs",
    );
    const tests = expect(runMiniTestsSafe("a", "", [
      { id: "one", kind: "should-match", input: "a" },
    ])).rejects.toThrow("Pattern hangs");
    await vi.advanceTimersByTimeAsync(1500);
    await Promise.all([replacement, tests]);
    expect(MockWorker.instances.every((worker) => worker.terminate.mock.calls.length === 1)).toBe(
      true,
    );
  });
});
