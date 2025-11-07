# Settings API

The Settings API provides a high-level interface for managing user preferences and tool-specific settings.

## Interface

```typescript
interface SettingsManager {
  getUserPreferences(): Promise<UserPreferences>
  updatePreferences(updates: Partial<UserPreferences>): Promise<void>
  getToolSettings(toolId: string): Promise<Record<string, unknown>>
  updateToolSettings(toolId: string, settings: Partial<Record<string, unknown>>): Promise<void>
  resetToDefaults(): Promise<void>
}
```

## Types

### UserPreferences

```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  accessibility: AccessibilitySettings
  privacy: PrivacySettings
  shortcuts: Record<string, string>
  toolDefaults: Record<string, any>
}
```

### AccessibilitySettings

```typescript
interface AccessibilitySettings {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReader: boolean
}
```

### PrivacySettings

```typescript
interface PrivacySettings {
  analytics: boolean
  errorReporting: boolean
  cloudSync: boolean
  dataRetention: number  // days
}
```

## Usage

### Creating Settings Manager

```typescript
import { DefaultSettingsManager } from '@/lib/core/settings'
import { storageService } from '@/lib/services/storage'

const settingsManager = new DefaultSettingsManager(storageService)
```

### Getting User Preferences

```typescript
const preferences = await settingsManager.getUserPreferences()

console.log(preferences.theme)           // 'dark'
console.log(preferences.language)        // 'en'
console.log(preferences.accessibility)   // { reducedMotion: false, ... }
```

### Updating User Preferences

```typescript
// Update theme
await settingsManager.updatePreferences({
  theme: 'dark'
})

// Update accessibility settings
await settingsManager.updatePreferences({
  accessibility: {
    reducedMotion: true,
    highContrast: true,
    fontSize: 'large',
    screenReader: false
  }
})

// Update multiple preferences
await settingsManager.updatePreferences({
  theme: 'dark',
  language: 'es',
  privacy: {
    analytics: false,
    errorReporting: true,
    cloudSync: false,
    dataRetention: 30
  }
})
```

### Getting Tool Settings

```typescript
// Get calculator settings
const calcSettings = await settingsManager.getToolSettings('calculator')

console.log(calcSettings.precision)     // 2
console.log(calcSettings.angleUnit)     // 'deg'
```

### Updating Tool Settings

```typescript
// Update calculator settings
await settingsManager.updateToolSettings('calculator', {
  precision: 4,
  angleUnit: 'rad'
})

// Update hash tool settings
await settingsManager.updateToolSettings('hash', {
  defaultAlgorithm: 'sha256',
  uppercase: true
})
```

### Resetting to Defaults

```typescript
// Reset all preferences to defaults
await settingsManager.resetToDefaults()

// User preferences are now:
// - theme: 'system'
// - language: 'en'
// - accessibility: all false/medium
// - privacy: analytics false, errorReporting true
```

## Default Values

### Default User Preferences

```typescript
{
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
    dataRetention: 30
  },
  shortcuts: {},
  toolDefaults: {}
}
```

## Common Patterns

### React Hook for Settings

```typescript
import { useEffect, useState } from 'react'
import { settingsManager } from '@/lib/services/settings'

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsManager.getUserPreferences()
      .then(setPreferences)
      .finally(() => setLoading(false))
  }, [])

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    await settingsManager.updatePreferences(updates)
    const updated = await settingsManager.getUserPreferences()
    setPreferences(updated)
  }

  return { preferences, loading, updatePreferences }
}

// Usage in component
function SettingsPage() {
  const { preferences, loading, updatePreferences } = useUserPreferences()

  if (loading) return <Spinner />

  return (
    <div>
      <ThemeSelector
        value={preferences.theme}
        onChange={(theme) => updatePreferences({ theme })}
      />
    </div>
  )
}
```

### Settings Context Provider

```typescript
import { createContext, useContext, useEffect, useState } from 'react'

interface SettingsContextValue {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaults())

  useEffect(() => {
    settingsManager.getUserPreferences().then(setPreferences)
  }, [])

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    await settingsManager.updatePreferences(updates)
    const updated = await settingsManager.getUserPreferences()
    setPreferences(updated)
  }

  return (
    <SettingsContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
```

### Tool-Specific Settings Hook

```typescript
export function useToolSettings(toolId: string) {
  const [settings, setSettings] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsManager.getToolSettings(toolId)
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [toolId])

  const updateSettings = async (updates: Partial<Record<string, unknown>>) => {
    await settingsManager.updateToolSettings(toolId, updates)
    const updated = await settingsManager.getToolSettings(toolId)
    setSettings(updated)
  }

  return { settings, loading, updateSettings }
}

// Usage
function CalculatorSettings() {
  const { settings, updateSettings } = useToolSettings('calculator')

  return (
    <div>
      <label>
        Precision:
        <input
          type="number"
          value={settings.precision as number}
          onChange={(e) => updateSettings({ precision: e.target.valueAsNumber })}
        />
      </label>
    </div>
  )
}
```

## Persistence

Settings are automatically persisted to storage:

- **Storage Key**: `user-preferences` for user preferences
- **Storage Key**: `tool-data` for tool settings
- **Backend**: Uses StorageService (IndexedDB/localStorage)
- **Automatic**: Changes are saved immediately

## Error Handling

```typescript
try {
  await settingsManager.updatePreferences({ theme: 'dark' })
} catch (error) {
  console.error('Failed to update preferences:', error)
  // Show error to user
}
```

## Performance Considerations

1. **Caching**: Preferences are cached in memory after first load
2. **Debouncing**: Consider debouncing frequent updates
3. **Partial Updates**: Only changed values are updated
4. **Lazy Loading**: Tool settings loaded on-demand

## Migration Guide

### From Direct Storage Access

```typescript
// Old code
const theme = localStorage.getItem('theme')
localStorage.setItem('theme', 'dark')

// New code
const preferences = await settingsManager.getUserPreferences()
const theme = preferences.theme
await settingsManager.updatePreferences({ theme: 'dark' })
```

### From Zustand Store

```typescript
// Old code
const useSettingsStore = create((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme })
}))

// New code with persistence
const useSettingsStore = create((set) => ({
  theme: 'system',
  setTheme: async (theme) => {
    await settingsManager.updatePreferences({ theme })
    set({ theme })
  }
}))

// Initialize from storage
settingsManager.getUserPreferences().then((prefs) => {
  useSettingsStore.setState({ theme: prefs.theme })
})
```

## Testing

```typescript
import { DefaultSettingsManager } from '@/lib/core/settings'
import { MockStorageService } from '@/lib/services/storage.mock'

describe('SettingsManager', () => {
  let settingsManager: DefaultSettingsManager
  let mockStorage: MockStorageService

  beforeEach(() => {
    mockStorage = new MockStorageService()
    settingsManager = new DefaultSettingsManager(mockStorage)
  })

  it('should return default preferences', async () => {
    const prefs = await settingsManager.getUserPreferences()
    expect(prefs.theme).toBe('system')
  })

  it('should update preferences', async () => {
    await settingsManager.updatePreferences({ theme: 'dark' })
    const prefs = await settingsManager.getUserPreferences()
    expect(prefs.theme).toBe('dark')
  })

  it('should manage tool settings', async () => {
    await settingsManager.updateToolSettings('calc', { precision: 4 })
    const settings = await settingsManager.getToolSettings('calc')
    expect(settings.precision).toBe(4)
  })
})
```

## See Also

- [Storage API](./storage-api.md)
- [Validation API](./validation-api.md)
- [Type Definitions](../../src/types/index.ts)
