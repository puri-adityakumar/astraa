import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MEMORY_RESOLUTION_DELAY_MS, scheduleMemoryResolution } from "./memory-client";

describe("Memory resolution timer boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dispatches one resolution after the fixed reveal period", () => {
    const resolve = vi.fn();
    scheduleMemoryResolution(resolve);

    vi.advanceTimersByTime(MEMORY_RESOLUTION_DELAY_MS - 1);
    expect(resolve).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it.each(["matching", "mismatching"])(
    "cancels a pending %s resolution during reset or unmount",
    () => {
      const resolve = vi.fn();
      const cancel = scheduleMemoryResolution(resolve);

      cancel();
      cancel();
      vi.runAllTimers();

      expect(resolve).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it("keeps only the latest boundary when a resolving effect is replaced", () => {
    const staleResolve = vi.fn();
    const currentResolve = vi.fn();
    const cancelStale = scheduleMemoryResolution(staleResolve);

    cancelStale();
    scheduleMemoryResolution(currentResolve);
    vi.runAllTimers();

    expect(staleResolve).not.toHaveBeenCalled();
    expect(currentResolve).toHaveBeenCalledTimes(1);
  });
});
