import { afterEach, describe, expect, it, vi } from "vitest";

import { runMatchesSafe } from "./redos-client";

const originalWorker = Object.getOwnPropertyDescriptor(globalThis, "Worker");
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

afterEach(() => {
  vi.useRealTimers();
  if (originalWorker) Object.defineProperty(globalThis, "Worker", originalWorker);
  else Reflect.deleteProperty(globalThis, "Worker");
  if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
  else Reflect.deleteProperty(globalThis, "window");
});

describe("runMatchesSafe", () => {
  it("fails closed when workers are unavailable", async () => {
    Reflect.deleteProperty(globalThis, "Worker");

    await expect(runMatchesSafe("(a+)+$", "g", "a".repeat(1_000))).resolves.toMatchObject({
      status: "unavailable",
      results: [],
      hardTimeout: false,
    });
  });

  it("terminates a hanging worker at the hard timeout", async () => {
    vi.useFakeTimers();
    const terminate = vi.fn();
    class HangingWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      postMessage(): void {}
      terminate = terminate;
    }
    Object.defineProperty(globalThis, "Worker", {
      configurable: true,
      value: HangingWorker,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { clearTimeout, setTimeout },
    });

    const resultPromise = runMatchesSafe("(a+)+$", "g", "a".repeat(1_000), {
      hardTimeoutMs: 50,
    });
    await vi.advanceTimersByTimeAsync(50);

    await expect(resultPromise).resolves.toMatchObject({
      status: "timed-out",
      timedOut: true,
      hardTimeout: true,
    });
    expect(terminate).toHaveBeenCalledOnce();
  });

  it("cancels and terminates obsolete work", async () => {
    const terminate = vi.fn();
    class PendingWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      postMessage(): void {}
      terminate = terminate;
    }
    Object.defineProperty(globalThis, "Worker", {
      configurable: true,
      value: PendingWorker,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { clearTimeout, setTimeout },
    });
    const controller = new AbortController();
    const resultPromise = runMatchesSafe("a", "g", "a", {
      signal: controller.signal,
    });

    controller.abort();

    await expect(resultPromise).resolves.toMatchObject({ status: "cancelled" });
    expect(terminate).toHaveBeenCalledOnce();
  });
});
