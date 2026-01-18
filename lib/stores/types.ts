// Core types for Zustand stores

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  accessibility: AccessibilitySettings
  privacy: PrivacySettings
  shortcuts: Record<string, string>
  toolDefaults: Record<string, any>
}

export interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReader: boolean
}

export interface PrivacySettings {
  analytics: boolean
  errorReporting: boolean
  cloudSync: boolean
  dataSharing: boolean
}

export interface ToolSettings {
  [toolId: string]: {
    settings: Record<string, any>
    shortcuts: KeyboardShortcut[]
    exportFormats: ExportFormat[]
    importFormats: ImportFormat[]
    lastUsed?: Date
    usageCount?: number
  }
}

export interface KeyboardShortcut {
  id: string
  key: string
  description: string
  action: string
}

export interface ExportFormat {
  id: string
  name: string
  extension: string
  mimeType: string
}

export interface ImportFormat {
  id: string
  name: string
  extensions: string[]
  mimeTypes: string[]
}

export interface Activity {
  id: string
  type: 'tool' | 'game'
  name: string
  icon: string
  timestamp: Date
  location?: string  // Optional - only populated if real location tracking is implemented
  sessionId: string
  metadata?: Record<string, any>
}

export interface ActivityStats {
  totalUsage: number
  popularTools: Array<{ name: string; count: number; icon: string }>
  recentActivities: Activity[]
  activeUsers: number
  sessionStartTime: Date
  dailyUsage: Record<string, number>
}

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  errorCount: number
}

export interface UsageAnalytics {
  toolUsage: Record<string, number>
  featureUsage: Record<string, number>
  errorRates: Record<string, number>
  performanceMetrics: PerformanceMetrics
}