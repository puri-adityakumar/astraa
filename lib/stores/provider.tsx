"use client";

import { useEffect, ReactNode } from "react";
import {
  useUserPreferences,
  useActivityTracking,
  useToolSettings,
} from "./index";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes stores and handles cross-store interactions
 * This component should wrap the app to ensure stores are properly initialized
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const { preferences } = useUserPreferences();
  const { trackPerformance } = useActivityTracking();

  // Initialize performance tracking
  useEffect(() => {
    const startTime = performance.now();

    // Track initial load performance
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      trackPerformance({ loadTime });
    };

    // Track memory usage if available
    const trackMemoryUsage = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        trackPerformance({
          memoryUsage: memory.usedJSHeapSize,
        });
      }
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
    }

    // Track memory usage periodically
    const memoryInterval = setInterval(trackMemoryUsage, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener("load", handleLoad);
      clearInterval(memoryInterval);
    };
  }, [trackPerformance]);

  // Apply accessibility preferences to document
  useEffect(() => {
    const { accessibility } = preferences;

    // Apply reduced motion preference
    if (accessibility.reducedMotion) {
      document.documentElement.style.setProperty("--motion-reduce", "1");
    } else {
      document.documentElement.style.removeProperty("--motion-reduce");
    }

    // Apply font size preference
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    document.documentElement.style.setProperty(
      "--base-font-size",
      fontSizeMap[accessibility.fontSize],
    );

    // Apply high contrast preference
    if (accessibility.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [preferences.accessibility]);

  // Clean up old activities periodically
  useEffect(() => {
    const { clearOldActivities } = useActivityTracking.getState();

    // Clean up activities older than 30 days on mount
    clearOldActivities(30);

    // Set up periodic cleanup (daily)
    const cleanupInterval = setInterval(
      () => {
        clearOldActivities(30);
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours

    return () => clearInterval(cleanupInterval);
  }, []);

  return <>{children}</>;
}

/**
 * Hook to get all store states in one place
 * Useful for debugging or when you need access to multiple stores
 */
export function useStores() {
  const userPreferences = useUserPreferences();
  const toolSettings = useToolSettings();
  const activityTracking = useActivityTracking();

  return {
    userPreferences,
    toolSettings,
    activityTracking,
  };
}
