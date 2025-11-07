export interface ThemeVariables {
  [key: string]: string
}

export interface Theme {
  name: string
  displayName: string
  variables: ThemeVariables
  description?: string
}

export interface ThemeConfig {
  light: Theme
  dark: Theme
  'light-high-contrast': Theme
  'dark-high-contrast': Theme
}

export type ThemeMode = keyof ThemeConfig | 'system'

export interface AccessibilityPreferences {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  focusIndicators: 'default' | 'enhanced'
}