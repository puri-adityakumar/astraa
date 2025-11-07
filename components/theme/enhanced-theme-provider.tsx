"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { AccessibilityPreferences, ThemeMode } from "@/lib/themes/types"
import { themes } from "@/lib/themes/theme-config"

interface AccessibilityContextType {
  preferences: AccessibilityPreferences
  updatePreferences: (updates: Partial<AccessibilityPreferences>) => void
  applyTheme: (theme: ThemeMode) => void
}

const AccessibilityContext = React.createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within EnhancedThemeProvider")
  }
  return context
}

interface EnhancedThemeProviderProps extends ThemeProviderProps {
  children: React.ReactNode
}

export function EnhancedThemeProvider({ children, ...props }: EnhancedThemeProviderProps) {
  const [preferences, setPreferences] = React.useState<AccessibilityPreferences>({
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    focusIndicators: 'default'
  })

  const [mounted, setMounted] = React.useState(false)

  // Detect system preferences on mount
  React.useEffect(() => {
    setMounted(true)
    
    // Check for reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPreferences(prev => ({ ...prev, reducedMotion: reducedMotionQuery.matches }))

    // Check for high contrast preference
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)')
    setPreferences(prev => ({ ...prev, highContrast: highContrastQuery.matches }))

    // Listen for changes
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setPreferences(prev => ({ ...prev, highContrast: e.matches }))
    }

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
    highContrastQuery.addEventListener('change', handleHighContrastChange)

    // Load saved preferences from localStorage
    try {
      const saved = localStorage.getItem('accessibility-preferences')
      if (saved) {
        const savedPrefs = JSON.parse(saved)
        setPreferences(prev => ({ ...prev, ...savedPrefs }))
      }
    } catch (error) {
      console.error('Failed to load accessibility preferences:', error)
    }

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
    }
  }, [])

  // Apply accessibility preferences to document
  React.useEffect(() => {
    if (!mounted) return

    const root = document.documentElement

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${preferences.fontSize}`)

    // Apply focus indicators
    if (preferences.focusIndicators === 'enhanced') {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }

    // Save preferences to localStorage
    try {
      localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save accessibility preferences:', error)
    }
  }, [preferences, mounted])

  const updatePreferences = React.useCallback((updates: Partial<AccessibilityPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }))
  }, [])

  const applyTheme = React.useCallback((theme: ThemeMode) => {
    if (theme === 'system') return

    const themeConfig = themes[theme as keyof typeof themes]
    if (!themeConfig) return

    const root = document.documentElement
    Object.entries(themeConfig.variables).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }, [])

  const contextValue = React.useMemo(
    () => ({ preferences, updatePreferences, applyTheme }),
    [preferences, updatePreferences, applyTheme]
  )

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <NextThemesProvider {...props}>
        {children}
      </NextThemesProvider>
    </AccessibilityContext.Provider>
  )
}
