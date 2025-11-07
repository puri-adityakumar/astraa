# Astraa API Documentation

This directory contains comprehensive API documentation for the Astraa tools platform.

## Table of Contents

- [Storage API](./storage-api.md) - Data persistence and storage services
- [Validation API](./validation-api.md) - Input validation and sanitization
- [Settings API](./settings-api.md) - User preferences and tool settings management
- [External APIs](./external-apis.md) - Third-party API integrations

## Quick Start

### Storage API

```typescript
import { storageService } from '@/lib/services/storage'

// Save data
await storageService.save('user-preferences', {
  theme: 'dark',
  language: 'en'
})

// Load data
const preferences = await storageService.load('user-preferences')
```

### Validation API

```typescript
import { validateData, userPreferencesSchema } from '@/lib/core/validation'

// Validate user input
const validPreferences = validateData(userPreferencesSchema, userInput)
```

### Settings API

```typescript
import { DefaultSettingsManager } from '@/lib/core/settings'
import { storageService } from '@/lib/services/storage'

const settingsManager = new DefaultSettingsManager(storageService)

// Get user preferences
const preferences = await settingsManager.getUserPreferences()

// Update preferences
await settingsManager.updatePreferences({ theme: 'dark' })
```

## Architecture Overview

The Astraa API is organized into several layers:

1. **Core Layer** (`src/lib/core/`) - Core business logic and utilities
2. **Services Layer** (`src/lib/services/`) - Service implementations
3. **Types Layer** (`src/types/`) - TypeScript type definitions
4. **Config Layer** (`src/config/`) - Configuration and constants

## Error Handling

All APIs use consistent error handling patterns:

```typescript
import { ValidationError } from '@/lib/core/validation'

try {
  const data = await storageService.load('key')
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
    console.error(`Validation failed: ${error.message}`)
  } else {
    // Handle other errors
    console.error('Operation failed:', error)
  }
}
```

## Type Safety

All APIs are fully typed with TypeScript:

```typescript
import type { UserPreferences, StorageService } from '@/types'

const preferences: UserPreferences = {
  theme: 'dark',
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

## Best Practices

1. **Always validate input data** using Zod schemas before processing
2. **Handle errors gracefully** with try-catch blocks
3. **Use TypeScript types** for better IDE support and compile-time checking
4. **Follow async/await patterns** for asynchronous operations
5. **Clean up resources** when no longer needed

## API Versioning

Current API version: `1.0.0`

Breaking changes will be documented in the [CHANGELOG](../CHANGELOG.md).

## Support

For issues, questions, or contributions:
- [GitHub Issues](https://github.com/puri-adityakumar/astraa/issues)
- [Contributing Guidelines](../CONTRIBUTING.md)
