/**
 * Migration utilities to help transition from Context API to Zustand stores
 * This file provides compatibility layers and migration functions
 */

import { useActivityTracking } from './activity-tracking'
import { useToolSettings } from './tool-settings'
import { tools, toolCategories } from '../tools'

/**
 * Compatibility hook that mimics the old useActivity hook
 * This allows existing components to work without changes during migration
 */
export function useActivity() {
  const { stats, trackActivity } = useActivityTracking()
  
  return {
    stats,
    trackActivity
  }
}

/**
 * Compatibility hook that mimics the old useTools hook
 * This provides the same interface as the Context API version
 */
export function useTools() {
  const { updateToolUsage } = useToolSettings()
  
  // Track tool usage when tools are accessed
  const trackToolAccess = (toolName: string) => {
    const tool = tools.find(t => t.name === toolName)
    if (tool) {
      updateToolUsage(tool.path)
    }
  }
  
  return {
    tools,
    categories: toolCategories,
    updateTools: (_newTools: typeof tools) => {
      // This was used for dynamic tool updates in the old system
      // In the new system, tools are static, but we can track usage
      console.warn('updateTools is deprecated. Tools are now static.')
    },
    updateCategories: (_newCategories: typeof toolCategories) => {
      // Similar to updateTools, this is now deprecated
      console.warn('updateCategories is deprecated. Categories are now static.')
    },
    trackToolAccess
  }
}

/**
 * Migration function to import data from the old Context API localStorage
 * This should be called once during the migration process
 */
export function migrateFromContextAPI() {
  try {
    // Check if there's old activity data in localStorage
    const oldActivityData = localStorage.getItem('activity-context-data')
    if (oldActivityData) {
      const parsedData = JSON.parse(oldActivityData)
      
      // Migrate to new activity tracking store
      const { trackActivity } = useActivityTracking.getState()
      
      if (parsedData.recentActivities) {
        parsedData.recentActivities.forEach((activity: any) => {
          // Convert old activity format to new format
          trackActivity(activity.type, activity.name, {
            migratedFrom: 'context-api',
            originalTimestamp: activity.timestamp
          })
        })
      }
      
      // Remove old data after migration
      localStorage.removeItem('activity-context-data')
      console.log('Successfully migrated activity data from Context API')
    }
    
    // Check for old tool settings
    const oldToolData = localStorage.getItem('tools-context-data')
    if (oldToolData) {
      const parsedData = JSON.parse(oldToolData)
      
      // Migrate tool preferences if any
      const { updateToolSettings } = useToolSettings.getState()
      
      if (parsedData.toolPreferences) {
        Object.entries(parsedData.toolPreferences).forEach(([toolId, settings]) => {
          updateToolSettings(toolId, {
            settings: settings as any,
            lastUsed: new Date()
          })
        })
      }
      
      // Remove old data after migration
      localStorage.removeItem('tools-context-data')
      console.log('Successfully migrated tool data from Context API')
    }
    
  } catch (error) {
    console.error('Error during Context API migration:', error)
  }
}

/**
 * Utility to check if migration is needed
 */
export function needsMigration(): boolean {
  const hasOldActivityData = localStorage.getItem('activity-context-data') !== null
  const hasOldToolData = localStorage.getItem('tools-context-data') !== null
  
  return hasOldActivityData || hasOldToolData
}

/**
 * Hook to automatically handle migration on app startup
 */
export function useMigration() {
  const migrationNeeded = needsMigration()
  
  if (migrationNeeded) {
    migrateFromContextAPI()
  }
  
  return { migrationNeeded }
}