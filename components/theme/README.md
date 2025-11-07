# Enhanced Theme System

This directory contains the enhanced theme system implementation with comprehensive accessibility features.

## Components

### EnhancedThemeProvider
The main provider component that wraps the application and provides theme and accessibility context.

**Features:**
- System preference detection (dark mode, reduced motion, high contrast)
- Accessibility preferences management
- Theme variable application
- LocalStorage persistence

**Usage:**
```tsx
import { EnhancedThemeProvider } from '@/components/theme/enhanced-theme-provider'

<EnhancedThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</EnhancedThemeProvider>
```

### EnhancedThemeToggle
A dropdown menu component for theme selection and accessibility settings.

**Features:**
- Theme selection (Light, Dark, High Contrast variants, System)
- Quick accessibility toggles (Reduced Motion, Enhanced Focus)
- Font size selection
- Theme descriptions

**Usage:**
```tsx
import { EnhancedThemeToggle } from '@/components/theme/enhanced-theme-toggle'

<EnhancedThemeToggle />
```

### useAccessibility Hook
Custom hook for accessing and updating accessibility preferences.

**Usage:**
```tsx
import { useAccessibility } from '@/components/theme/enhanced-theme-provider'

function MyComponent() {
  const { preferences, updatePreferences, applyTheme } = useAccessibility()
  
  return (
    <div>
      <p>Reduced Motion: {preferences.reducedMotion ? 'On' : 'Off'}</p>
      <button onClick={() => updatePreferences({ reducedMotion: true })}>
        Enable Reduced Motion
      </button>
    </div>
  )
}
```

## Theme Configuration

Themes are defined in `lib/themes/theme-config.ts` with the following structure:

```typescript
{
  light: Theme
  dark: Theme
  'light-high-contrast': Theme
  'dark-high-contrast': Theme
}
```

Each theme includes:
- `name`: Internal theme identifier
- `displayName`: User-facing theme name
- `description`: Brief description of the theme
- `variables`: HSL color values for all design tokens

## Accessibility Preferences

The system tracks the following accessibility preferences:

```typescript
interface AccessibilityPreferences {
  reducedMotion: boolean      // Minimize animations
  highContrast: boolean        // Use high contrast theme
  fontSize: 'small' | 'medium' | 'large'  // Text size
  focusIndicators: 'default' | 'enhanced' // Focus visibility
}
```

## Design Tokens

All color tokens are defined as CSS variables and can be used in Tailwind:

- `background` / `foreground`
- `card` / `card-foreground`
- `primary` / `primary-foreground`
- `secondary` / `secondary-foreground`
- `muted` / `muted-foreground`
- `accent` / `accent-foreground`
- `destructive` / `destructive-foreground`
- `success` / `success-foreground`
- `warning` / `warning-foreground`
- `info` / `info-foreground`
- `border`, `input`, `ring`

## Testing

Run tests with:
```bash
npm test components/theme/__tests__/theme-system.test.tsx
```

## Migration from Old Theme System

If you're using the old `ThemeProvider` and `ThemeToggle`:

1. Replace `ThemeProvider` with `EnhancedThemeProvider` in your layout
2. Replace `ThemeToggle` with `EnhancedThemeToggle` in your navigation
3. Add accessibility components (`KeyboardNavDetector`, `SkipToMain`)
4. Update any hardcoded theme references to use the new theme names

The old components are still available for backward compatibility.
