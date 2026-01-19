# Zustand Store Implementation

This directory contains the enhanced state management implementation using Zustand, replacing the previous Context API approach.

## Overview

The new state management system provides:

- **Better Performance**: Zustand is more efficient than Context API for frequent updates
- **Persistence**: Automatic persistence to localStorage/IndexedDB with migration support
- **Type Safety**: Full TypeScript support with proper type definitions
- **Modularity**: Separate stores for different concerns
- **Migration Support**: Seamless transition from the old Context API

## Store Structure

### 1. User Preferences Store (`user-preferences.ts`)

Manages user settings and preferences:

- Theme preferences (light/dark/system)
- Accessibility settings (reduced motion, high contrast, font size)
- Privacy settings (analytics, error reporting, cloud sync)
- Keyboard shortcuts
- Tool defaults

### 2. Tool Settings Store (`tool-settings.ts`)

Manages individual tool configurations:

- Tool-specific settings
- Usage tracking and statistics
- Last used timestamps
- Export/import functionality for tool configurations

### 3. Activity Tracking Store (`activity-tracking.ts`)

Handles user activity and analytics:

- Activity logging and history
- Usage statistics and popular tools
- Performance metrics
- Error tracking
- Session management

## Usage Examples

### Basic Usage

```typescript
import { useUserPreferences, useToolSettings, useActivityTracking } from '@/lib/stores'

function MyComponent() {
  // User preferences
  const { preferences, updatePreferences } = useUserPreferences()

  // Tool settings
  const { getToolSettings, updateToolSettings } = useToolSettings()

  // Activity tracking
  const { trackActivity, stats } = useActivityTracking()

  // Update theme
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updatePreferences({ theme })
  }

  // Track tool usage
  const handleToolUse = (toolName: string) => {
    trackActivity('tool', toolName)
  }

  return (
    <div>
      <p>Current theme: {preferences.theme}</p>
      <p>Total usage: {stats.totalUsage}</p>
    </div>
  )
}
```

### Migration from Context API

The stores include compatibility hooks that maintain the same interface as the old Context API:

```typescript
// Old way (still works during migration)
import { useActivity, useTools } from "@/lib/stores";

function LegacyComponent() {
  const { stats, trackActivity } = useActivity(); // Same interface as before
  const { tools, categories } = useTools(); // Same interface as before

  // Your existing code works unchanged
}
```

### Advanced Usage

```typescript
import { useStores } from "@/lib/stores";

function AdvancedComponent() {
  // Access all stores at once
  const { userPreferences, toolSettings, activityTracking } = useStores();

  // Complex operations across multiple stores
  const handleComplexAction = () => {
    // Update preferences
    userPreferences.updatePreferences({ theme: "dark" });

    // Track the action
    activityTracking.trackActivity("tool", "theme-switcher");

    // Update tool settings
    toolSettings.updateToolSettings("theme-switcher", {
      settings: { lastTheme: "dark" },
    });
  };
}
```

## Integration Guide

### 1. Add Store Provider to Layout

Replace the old Context providers with the new StoreProvider:

```typescript
// app/layout.tsx
import { StoreProvider } from '@/lib/stores'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <StoreProvider>
            {/* Your app content */}
            {children}
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. Migration Process

The migration happens automatically when the app starts:

```typescript
import { useMigration } from '@/lib/stores'

function App() {
  const { migrationNeeded } = useMigration()

  if (migrationNeeded) {
    console.log('Migrating from Context API to Zustand...')
  }

  return <YourApp />
}
```

### 3. Gradual Migration

You can migrate components gradually:

1. **Phase 1**: Add StoreProvider alongside existing providers
2. **Phase 2**: Update components one by one to use new stores
3. **Phase 3**: Remove old Context providers when all components are migrated

## Persistence

### localStorage (Default)

- User preferences and tool settings use localStorage
- Automatic serialization/deserialization
- Version migration support

### IndexedDB (Enhanced)

- Activity tracking uses IndexedDB for better performance with large datasets
- Automatic fallback to localStorage if IndexedDB is unavailable
- Suitable for storing large amounts of activity data

### Data Management

```typescript
import {
  exportAllStoredData,
  importStoredData,
  clearAllStoredData,
} from "@/lib/stores/storage";

// Export all data for backup
const backup = await exportAllStoredData();

// Import data from backup
await importStoredData(backup);

// Clear all data (useful for testing or reset)
await clearAllStoredData();
```

## Performance Considerations

### Selective Subscriptions

Zustand allows components to subscribe only to the data they need:

```typescript
// Only re-render when theme changes
const theme = useUserPreferences((state) => state.preferences.theme);

// Only re-render when total usage changes
const totalUsage = useActivityTracking((state) => state.stats.totalUsage);
```

### Batch Updates

Multiple updates are automatically batched:

```typescript
const { updatePreferences } = useUserPreferences();

// These updates are batched together
updatePreferences({
  theme: "dark",
  language: "en",
  accessibility: { ...newAccessibilitySettings },
});
```

## Testing

The stores are designed to be easily testable:

```typescript
import { useUserPreferences } from "@/lib/stores";

// In tests, you can directly access and modify store state
const { getState, setState } = useUserPreferences;

// Set initial state for testing
setState({
  preferences: {
    theme: "light",
    // ... other preferences
  },
});

// Test component behavior
const result = getState().preferences.theme;
expect(result).toBe("light");
```

## Best Practices

1. **Use Selective Subscriptions**: Only subscribe to the data your component needs
2. **Batch Related Updates**: Group related state changes together
3. **Handle Errors Gracefully**: The stores include error handling for persistence operations
4. **Monitor Performance**: Use the built-in performance tracking features
5. **Respect Privacy Settings**: Check privacy preferences before collecting analytics

## Troubleshooting

### Common Issues

1. **Hydration Mismatch**: Make sure to use `suppressHydrationWarning` in your layout
2. **Storage Errors**: The stores automatically fall back to localStorage if IndexedDB fails
3. **Migration Issues**: Check browser console for migration logs and errors

### Debug Mode

Enable debug logging by setting localStorage:

```javascript
localStorage.setItem("zustand-debug", "true");
```

This will log all store actions and state changes to the console.
