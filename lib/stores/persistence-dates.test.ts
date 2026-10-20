import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createJSONStorage } from "zustand/middleware";
import { useActivityTracking } from "./activity-tracking";
import { useToolSettings } from "./tool-settings";
import type { Activity } from "./types";

const initialActivityState = useActivityTracking.getInitialState();
const initialToolState = useToolSettings.getInitialState();
const activityStorage = useActivityTracking.persist.getOptions().storage;
const toolStorage = useToolSettings.persist.getOptions().storage;

function storageWithState(state: unknown) {
  return createJSONStorage(() => ({
    getItem: async () => JSON.stringify({ state, version: 1 }),
    setItem: async () => {},
    removeItem: async () => {},
  }));
}

function activityAt(timestamp: Date): Activity {
  return {
    id: timestamp.toISOString(),
    type: "tool",
    name: "Calculator",
    icon: "Circle",
    timestamp,
    sessionId: "previous-session",
  };
}

beforeEach(async () => {
  await Promise.all([
    useActivityTracking.persist.rehydrate(),
    useToolSettings.persist.rehydrate(),
  ]);
  useActivityTracking.setState(initialActivityState);
  useToolSettings.setState(initialToolState);
});

afterEach(() => {
  useActivityTracking.persist.setOptions({ storage: activityStorage });
  useToolSettings.persist.setOptions({ storage: toolStorage });
  useActivityTracking.setState(initialActivityState);
  useToolSettings.setState(initialToolState);
});

describe("activity dates", () => {
  it("keeps recent activities after rehydrating and restores Date objects", async () => {
    const recent = activityAt(new Date(Date.now() - 60_000));
    const old = activityAt(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000));
    useActivityTracking.persist.setOptions({
      storage: storageWithState({
        stats: {
          ...initialActivityState.stats,
          sessionStartTime: new Date("2020-01-01T00:00:00.000Z"),
          recentActivities: [recent, old],
        },
        analytics: initialActivityState.analytics,
      }),
    });

    await useActivityTracking.persist.rehydrate();
    const rehydrated = useActivityTracking.getState();
    expect(rehydrated.stats.sessionStartTime).toBeInstanceOf(Date);
    expect(rehydrated.stats.sessionStartTime.getTime()).toBeGreaterThan(Date.now() - 10_000);
    expect(rehydrated.stats.recentActivities[0]?.timestamp).toBeInstanceOf(Date);
    expect(rehydrated.getRecentActivities()[0]?.timestamp.getTime()).toBe(
      recent.timestamp.getTime(),
    );
    rehydrated.clearOldActivities();
    expect(useActivityTracking.getState().stats.recentActivities).toEqual([recent]);
  });

  it("handles mixed Date and ISO-string timestamps in getters and cleanup", () => {
    const recentDate = new Date(Date.now() - 60_000);
    const recent = activityAt(recentDate);
    const serialized = JSON.parse(JSON.stringify(activityAt(new Date()))) as Activity;
    const old = JSON.parse(JSON.stringify(
      activityAt(new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)),
    )) as Activity;
    useActivityTracking.setState({
      stats: { ...initialActivityState.stats, recentActivities: [recent, serialized, old] },
    });
    useActivityTracking.getState().clearOldActivities();
    const activities = useActivityTracking.getState().getRecentActivities();
    expect(activities).toHaveLength(2);
    expect(activities.every(activity => activity.timestamp instanceof Date)).toBe(true);
    expect(activities[0]?.timestamp.getTime()).toBe(recentDate.getTime());
  });
});

describe("tool settings dates", () => {
  it("restores persisted lastUsed dates in raw state and getters", async () => {
    const lastUsed = new Date("2025-05-01T12:30:00.000Z");
    useToolSettings.persist.setOptions({
      storage: storageWithState({
        toolSettings: {
          calculator: {
            settings: {},
            shortcuts: [],
            exportFormats: [],
            importFormats: [],
            lastUsed,
            usageCount: 7,
          },
        },
      }),
    });
    await useToolSettings.persist.rehydrate();
    const state = useToolSettings.getState();
    expect(state.toolSettings.calculator?.lastUsed).toBeInstanceOf(Date);
    expect(state.getLastUsed("calculator")).toEqual(lastUsed);
    expect(state.getToolSettings("calculator")?.lastUsed).toEqual(lastUsed);
    expect(state.getToolUsageCount("calculator")).toBe(7);
    expect(state.getLastUsed("missing")).toBeNull();
    expect(state.getToolSettings("missing")).toBeNull();
  });

  it("normalizes ISO strings in getters without requiring rehydration", () => {
    const lastUsed = new Date("2025-05-01T12:30:00.000Z");
    useToolSettings.setState({
      toolSettings: JSON.parse(JSON.stringify({
        calculator: {
          settings: {},
          shortcuts: [],
          exportFormats: [],
          importFormats: [],
          lastUsed,
        },
      })),
    });
    expect(useToolSettings.getState().getLastUsed("calculator")).toEqual(lastUsed);
    expect(useToolSettings.getState().getToolSettings("calculator")?.lastUsed).toEqual(lastUsed);
    useToolSettings.getState().updateToolUsage("calculator");
    expect(useToolSettings.getState().getLastUsed("calculator")).toBeInstanceOf(Date);
    expect(useToolSettings.getState().getToolUsageCount("calculator")).toBe(1);
  });
});
