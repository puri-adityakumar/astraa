import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useActivityTracking } from "./activity-tracking";
import type { Activity, ActivityStats, UsageAnalytics } from "./types";

const baseStats = (): ActivityStats => ({
  totalUsage: 0,
  popularTools: [],
  recentActivities: [],
  activeUsers: 1,
  sessionStartTime: new Date(0),
  dailyUsage: {},
});

const makeActivity = (overrides: Partial<Activity>): Activity => ({
  id: Math.random().toString(36).slice(2),
  type: "tool",
  name: "tool",
  icon: "Circle",
  timestamp: new Date(),
  sessionId: "test",
  ...overrides,
});

describe("activity-tracking getPopularTools", () => {
  beforeEach(() => {
    useActivityTracking.setState({ stats: baseStats() });
  });

  it("returns an empty list when nothing has been tracked", () => {
    expect(useActivityTracking.getState().getPopularTools()).toEqual([]);
  });

  it("defaults to a limit of 5", () => {
    const popularTools = Array.from({ length: 8 }, (_, i) => ({
      name: `tool-${i}`,
      count: 8 - i,
      icon: "Circle",
    }));
    useActivityTracking.setState({ stats: { ...baseStats(), popularTools } });
    const result = useActivityTracking.getState().getPopularTools();
    expect(result).toHaveLength(5);
    expect(result[0]?.name).toBe("tool-0");
  });

  it("honors an explicit limit", () => {
    const popularTools = Array.from({ length: 8 }, (_, i) => ({
      name: `tool-${i}`,
      count: 8 - i,
      icon: "Circle",
    }));
    useActivityTracking.setState({ stats: { ...baseStats(), popularTools } });
    expect(useActivityTracking.getState().getPopularTools(3)).toHaveLength(3);
  });

  it("returns all entries when limit exceeds the available count", () => {
    const popularTools = [
      { name: "a", count: 2, icon: "Circle" },
      { name: "b", count: 1, icon: "Circle" },
    ];
    useActivityTracking.setState({ stats: { ...baseStats(), popularTools } });
    expect(useActivityTracking.getState().getPopularTools(50)).toHaveLength(2);
  });

  it("returns an empty list for a limit of 0", () => {
    const popularTools = [{ name: "a", count: 1, icon: "Circle" }];
    useActivityTracking.setState({ stats: { ...baseStats(), popularTools } });
    expect(useActivityTracking.getState().getPopularTools(0)).toEqual([]);
  });
});

describe("activity-tracking trackActivity popular-tool aggregation (Map boundary)", () => {
  beforeEach(() => {
    useActivityTracking.setState({ stats: baseStats() });
  });

  it("counts repeated tools and sorts by count descending", () => {
    const { trackActivity } = useActivityTracking.getState();
    trackActivity("tool", "alpha");
    trackActivity("tool", "beta");
    trackActivity("tool", "alpha");
    const popular = useActivityTracking.getState().stats.popularTools;
    expect(popular[0]).toMatchObject({ name: "alpha", count: 2 });
    expect(popular[1]).toMatchObject({ name: "beta", count: 1 });
  });

  it("caps popularTools at 10 distinct entries", () => {
    const { trackActivity } = useActivityTracking.getState();
    for (let i = 0; i < 12; i += 1) trackActivity("tool", `tool-${i}`);
    expect(useActivityTracking.getState().stats.popularTools).toHaveLength(10);
  });
});

describe("activity-tracking clearOldActivities (date + Map boundary cases)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const seedActivities = (activities: Activity[]) => {
    useActivityTracking.setState({
      stats: { ...baseStats(), recentActivities: activities },
    });
  };

  it("keeps recent activities and prunes ones older than the default 30 days", () => {
    const now = Date.now();
    const recent = makeActivity({
      name: "recent",
      timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000),
    });
    const old = makeActivity({
      name: "old",
      timestamp: new Date(now - 40 * 24 * 60 * 60 * 1000),
    });
    seedActivities([recent, old]);

    useActivityTracking.getState().clearOldActivities();

    const remaining = useActivityTracking.getState().stats.recentActivities;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.name).toBe("recent");
  });

  it("respects a custom daysToKeep window", () => {
    const now = Date.now();
    const within = makeActivity({
      name: "within",
      timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000),
    });
    const beyond = makeActivity({
      name: "beyond",
      timestamp: new Date(now - 10 * 24 * 60 * 60 * 1000),
    });
    seedActivities([within, beyond]);

    useActivityTracking.getState().clearOldActivities(7);

    const remaining = useActivityTracking.getState().stats.recentActivities;
    expect(remaining.map((a) => a.name)).toEqual(["within"]);
  });

  it("prunes an activity exactly at the cutoff (strictly-greater-than boundary)", () => {
    const now = Date.now();
    // The cutoff is exactly `now - daysToKeep` because timers are frozen and
    // clearOldActivities derives its cutoff from the same Date.now().
    const atCutoff = makeActivity({
      name: "at-cutoff",
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000),
    });
    seedActivities([atCutoff]);

    useActivityTracking.getState().clearOldActivities(5);

    expect(useActivityTracking.getState().stats.recentActivities).toHaveLength(0);
  });

  it("keeps an activity one millisecond newer than the cutoff", () => {
    const now = Date.now();
    const justInside = makeActivity({
      name: "just-inside",
      timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000 + 1),
    });
    seedActivities([justInside]);

    useActivityTracking.getState().clearOldActivities(5);

    const remaining = useActivityTracking.getState().stats.recentActivities;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.name).toBe("just-inside");
  });

  it("clears all activities when none fall inside the window", async () => {
    expect.hasAssertions();
    const now = Date.now();
    seedActivities([
      makeActivity({ name: "a", timestamp: new Date(now - 60 * 24 * 60 * 60 * 1000) }),
      makeActivity({ name: "b", timestamp: new Date(now - 90 * 24 * 60 * 60 * 1000) }),
    ]);

    await Promise.resolve(useActivityTracking.getState().clearOldActivities());

    expect(useActivityTracking.getState().stats.recentActivities).toEqual([]);
  });
});

describe("activity-tracking migrate()", () => {
  type MigratedState = { stats: ActivityStats; analytics: UsageAnalytics };
  const migrate = useActivityTracking.persist.getOptions().migrate!;

  it("merges a v0 blob over defaults, keeping accumulated usage data", () => {
    const oldBlob = {
      stats: {
        totalUsage: 12,
        popularTools: [{ name: "hash", count: 7, icon: "Hash" }],
        recentActivities: [
          {
            id: "a1",
            type: "tool",
            name: "hash",
            icon: "Hash",
            timestamp: new Date("2026-01-01T00:00:00.000Z"),
            sessionId: "s1",
            metadata: {},
          },
        ],
        dailyUsage: { "2026-01-01": 3 },
      },
      analytics: {
        toolUsage: { hash: 7, base64: 5 },
        errorRates: { hash: 1 },
      },
    };

    const migrated = migrate(oldBlob, 0) as MigratedState;

    // accumulated stats survive
    expect(migrated.stats.totalUsage).toBe(12);
    expect(migrated.stats.popularTools).toEqual([{ name: "hash", count: 7, icon: "Hash" }]);
    expect(migrated.stats.recentActivities).toHaveLength(1);
    expect(migrated.stats.recentActivities[0]?.name).toBe("hash");
    expect(migrated.stats.dailyUsage).toEqual({ "2026-01-01": 3 });

    // analytics survive
    expect(migrated.analytics.toolUsage).toEqual({ hash: 7, base64: 5 });
    expect(migrated.analytics.errorRates).toEqual({ hash: 1 });

    // missing fields are backfilled from defaults (no data left undefined)
    expect(migrated.stats.activeUsers).toBe(1);
    expect(migrated.stats.sessionStartTime).toBeInstanceOf(Date);
    expect(migrated.analytics.featureUsage).toEqual({});
    expect(migrated.analytics.performanceMetrics).toEqual({
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      errorCount: 0,
    });
  });

  it("backfills empty stats/analytics for a sparse v0 blob", () => {
    const migrated = migrate({ stats: {}, analytics: {} }, 0) as MigratedState;

    expect(migrated.stats.totalUsage).toBe(0);
    expect(migrated.stats.popularTools).toEqual([]);
    expect(migrated.stats.recentActivities).toEqual([]);
    expect(migrated.stats.dailyUsage).toEqual({});
    expect(migrated.analytics.toolUsage).toEqual({});
    expect(migrated.analytics.errorRates).toEqual({});
    expect(migrated.analytics.performanceMetrics.errorCount).toBe(0);
  });

  it("passes a current-version (v1) blob through untouched", () => {
    const current = {
      stats: {
        totalUsage: 1,
        popularTools: [],
        recentActivities: [],
        activeUsers: 1,
        sessionStartTime: new Date(),
        dailyUsage: {},
      },
      analytics: {
        toolUsage: {},
        featureUsage: {},
        errorRates: {},
        performanceMetrics: {
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0,
          errorCount: 0,
        },
      },
    };

    const migrated = migrate(current, 1);
    expect(migrated).toBe(current);
  });
});
