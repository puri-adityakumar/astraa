import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useToolSettings } from "./tool-settings";

describe("tool-settings usage tracking", () => {
  beforeEach(() => {
    useToolSettings.setState({ toolSettings: {} });
  });

  it("getToolUsageCount returns 0 for an unknown tool", () => {
    expect(useToolSettings.getState().getToolUsageCount("unknown")).toBe(0);
  });

  it("getLastUsed returns null for an unknown tool", () => {
    expect(useToolSettings.getState().getLastUsed("unknown")).toBeNull();
  });

  it("updateToolUsage creates an entry and sets count to 1 on first use", () => {
    useToolSettings.getState().updateToolUsage("hash");
    const entry = useToolSettings.getState().toolSettings["hash"];
    expect(entry?.usageCount).toBe(1);
    expect(useToolSettings.getState().getToolUsageCount("hash")).toBe(1);
  });

  it("updateToolUsage increments the count on repeated use", () => {
    const { updateToolUsage } = useToolSettings.getState();
    updateToolUsage("hash");
    updateToolUsage("hash");
    updateToolUsage("hash");
    expect(useToolSettings.getState().getToolUsageCount("hash")).toBe(3);
  });

  it("updateToolUsage tracks counts per tool independently", () => {
    const { updateToolUsage } = useToolSettings.getState();
    updateToolUsage("hash");
    updateToolUsage("hash");
    updateToolUsage("password");
    expect(useToolSettings.getState().getToolUsageCount("hash")).toBe(2);
    expect(useToolSettings.getState().getToolUsageCount("password")).toBe(1);
  });

  it("updateToolUsage records lastUsed and getLastUsed returns it", () => {
    vi.useFakeTimers();
    const at = new Date("2026-06-20T12:00:00.000Z");
    vi.setSystemTime(at);
    useToolSettings.getState().updateToolUsage("hash");
    const lastUsed = useToolSettings.getState().getLastUsed("hash");
    expect(lastUsed).toBeInstanceOf(Date);
    expect(lastUsed?.getTime()).toBe(at.getTime());
    vi.useRealTimers();
  });

  it("preserves existing settings while incrementing usage", () => {
    const { updateToolSettings, updateToolUsage } = useToolSettings.getState();
    updateToolSettings("hash", { settings: { algorithm: "sha256" } });
    updateToolUsage("hash");
    const entry = useToolSettings.getState().toolSettings["hash"];
    expect(entry?.settings).toEqual({ algorithm: "sha256" });
    expect(entry?.usageCount).toBe(1);
  });

  it("advances lastUsed across successive uses", async () => {
    expect.hasAssertions();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
    useToolSettings.getState().updateToolUsage("hash");
    const first = useToolSettings.getState().getLastUsed("hash")?.getTime();

    vi.setSystemTime(new Date("2026-06-20T12:05:00.000Z"));
    await Promise.resolve(useToolSettings.getState().updateToolUsage("hash"));
    const second = useToolSettings.getState().getLastUsed("hash")?.getTime();

    expect(second).toBeGreaterThan(first ?? 0);
    expect(useToolSettings.getState().getToolUsageCount("hash")).toBe(2);
    vi.useRealTimers();
  });
});

afterEach(() => {
  useToolSettings.setState({ toolSettings: {} });
});
