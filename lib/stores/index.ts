// Export all stores and types
export { useUserPreferences } from "./user-preferences";
export { useToolSettings } from "./tool-settings";
export { useActivityTracking } from "./activity-tracking";

// Export provider and migration utilities
export { StoreProvider, useStores } from "./provider";
export {
  useActivity,
  useTools,
  useMigration,
  migrateFromContextAPI,
  needsMigration,
} from "./migration";

export type * from "./types";

// Re-export commonly used types for convenience
export type {
  UserPreferences,
  AccessibilitySettings,
  PrivacySettings,
  ToolSettings,
  Activity,
  ActivityStats,
  UsageAnalytics,
  PerformanceMetrics,
} from "./types";
