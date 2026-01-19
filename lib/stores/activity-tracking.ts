import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createZustandStorage } from "./storage";
import type {
  Activity,
  ActivityStats,
  UsageAnalytics,
  PerformanceMetrics,
} from "./types";

interface ActivityTrackingState {
  stats: ActivityStats;
  analytics: UsageAnalytics;
  sessionId: string;
  trackActivity: (
    type: "tool" | "game",
    name: string,
    metadata?: Record<string, any>,
  ) => void;
  trackPerformance: (metric: Partial<PerformanceMetrics>) => void;
  trackError: (toolId: string, error: string) => void;
  getPopularTools: (
    limit?: number,
  ) => Array<{ name: string; count: number; icon: string }>;
  getRecentActivities: (limit?: number) => Activity[];
  getDailyUsage: (date?: Date) => number;
  clearOldActivities: (daysToKeep?: number) => void;
  exportAnalytics: () => string;
  generateSessionId: () => string;
}

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0] || "";
};

const defaultStats: ActivityStats = {
  totalUsage: 0,
  popularTools: [],
  recentActivities: [],
  activeUsers: 1,
  sessionStartTime: new Date(),
  dailyUsage: {},
};

const defaultAnalytics: UsageAnalytics = {
  toolUsage: {},
  featureUsage: {},
  errorRates: {},
  performanceMetrics: {
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    errorCount: 0,
  },
};

export const useActivityTracking = create<ActivityTrackingState>()(
  persist(
    (set, get) => ({
      stats: defaultStats,
      analytics: defaultAnalytics,
      sessionId: generateSessionId(),

      trackActivity: (type, name, metadata = {}) => {
        const { sessionId } = get();
        const now = new Date();
        const dateKey = getDateKey(now);

        const newActivity: Activity = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          name,
          icon: "Circle", // Default icon, should be updated based on tool
          timestamp: now,
          sessionId,
          metadata,
        };

        set((state) => {
          // Update stats
          const updatedRecentActivities = [
            newActivity,
            ...state.stats.recentActivities,
          ].slice(0, 50);

          // Update popular tools
          const toolCounts = new Map<string, { count: number; icon: string }>();
          updatedRecentActivities.forEach((activity) => {
            const current = toolCounts.get(activity.name) || {
              count: 0,
              icon: activity.icon,
            };
            toolCounts.set(activity.name, {
              ...current,
              count: current.count + 1,
            });
          });

          const popularTools = Array.from(toolCounts.entries())
            .map(([name, data]) => ({
              name,
              count: data.count,
              icon: data.icon,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          // Update daily usage
          const updatedDailyUsage = {
            ...state.stats.dailyUsage,
            [dateKey]: (state.stats.dailyUsage[dateKey] || 0) + 1,
          };

          // Update analytics
          const updatedAnalytics = {
            ...state.analytics,
            toolUsage: {
              ...state.analytics.toolUsage,
              [name]: (state.analytics.toolUsage[name] || 0) + 1,
            },
          };

          return {
            stats: {
              ...state.stats,
              totalUsage: state.stats.totalUsage + 1,
              popularTools,
              recentActivities: updatedRecentActivities,
              dailyUsage: updatedDailyUsage,
            },
            analytics: updatedAnalytics,
          };
        });
      },

      trackPerformance: (metric) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            performanceMetrics: {
              ...state.analytics.performanceMetrics,
              ...metric,
            },
          },
        }));
      },

      trackError: (toolId, _error) => {
        set((state) => ({
          analytics: {
            ...state.analytics,
            errorRates: {
              ...state.analytics.errorRates,
              [toolId]: (state.analytics.errorRates[toolId] || 0) + 1,
            },
            performanceMetrics: {
              ...state.analytics.performanceMetrics,
              errorCount: state.analytics.performanceMetrics.errorCount + 1,
            },
          },
        }));
      },

      getPopularTools: (limit = 5) => {
        const { stats } = get();
        return stats.popularTools.slice(0, limit);
      },

      getRecentActivities: (limit = 10) => {
        const { stats } = get();
        return stats.recentActivities.slice(0, limit);
      },

      getDailyUsage: (date = new Date()) => {
        const { stats } = get();
        const dateKey = getDateKey(date);
        return stats.dailyUsage[dateKey] || 0;
      },

      clearOldActivities: (daysToKeep = 30) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        set((state) => ({
          stats: {
            ...state.stats,
            recentActivities: state.stats.recentActivities.filter(
              (activity) => activity.timestamp > cutoffDate,
            ),
          },
        }));
      },

      exportAnalytics: () => {
        const { stats, analytics } = get();
        return JSON.stringify({ stats, analytics }, null, 2);
      },

      generateSessionId,
    }),
    {
      name: "activity-tracking",
      storage: createJSONStorage(() => createZustandStorage()),
      version: 1,
      partialize: (state) => ({
        // Only persist stats and analytics, not sessionId
        stats: state.stats,
        analytics: state.analytics,
      }),
      onRehydrateStorage: () => (state) => {
        // Generate new session ID on rehydration
        if (state) {
          state.sessionId = generateSessionId();
          state.stats.sessionStartTime = new Date();
        }
      },
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            stats: { ...defaultStats, ...persistedState.stats },
            analytics: { ...defaultAnalytics, ...persistedState.analytics },
          };
        }
        return persistedState;
      },
    },
  ),
);
