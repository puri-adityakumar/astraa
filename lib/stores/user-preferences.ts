import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { UserPreferences, AccessibilitySettings, PrivacySettings } from './types'

interface UserPreferencesState {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  updateAccessibilitySettings: (updates: Partial<AccessibilitySettings>) => void
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => void
  resetToDefaults: () => void
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    screenReader: false
  },
  privacy: {
    analytics: false,
    errorReporting: true,
    cloudSync: false,
    dataSharing: false
  },
  shortcuts: {
    'global.search': 'cmd+k',
    'global.theme': 'cmd+shift+t',
    'tool.copy': 'cmd+c',
    'tool.export': 'cmd+e',
    'tool.clear': 'cmd+shift+c'
  },
  toolDefaults: {}
}

import { createZustandStorage } from './storage'

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates
          }
        }))
      },
      
      updateAccessibilitySettings: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            accessibility: {
              ...state.preferences.accessibility,
              ...updates
            }
          }
        }))
      },
      
      updatePrivacySettings: (updates) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            privacy: {
              ...state.preferences.privacy,
              ...updates
            }
          }
        }))
      },
      
      resetToDefaults: () => {
        set({ preferences: defaultPreferences })
      }
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => createZustandStorage()),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration between versions if needed
        if (version === 0) {
          // Migrate from version 0 to 1
          return {
            ...persistedState,
            preferences: {
              ...defaultPreferences,
              ...persistedState.preferences
            }
          }
        }
        return persistedState
      }
    }
  )
)