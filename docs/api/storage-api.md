# Storage API

The Storage API provides a unified interface for data persistence with support for IndexedDB and localStorage fallback.

## Interface

```typescript
interface StorageService {
  save<T>(key: StorageKey, data: T, options?: StorageOptions): Promise<void>
  load<T>(key: StorageKey): Promise<T | null>
  delete(key: StorageKey): Promise<void>
  clear(): Promise<void>
  keys(): Promise<StorageKey[]>
  export(keys?: StorageKey[]): Promise<Blob>
  import(file: File): Promise<Record<StorageKey, any>>
  size(): Promise<number>
}
```

## Types

### StorageKey

```typescript
type StorageKey = string
```

Storage keys are used to identify stored data. Common keys:
- `user-preferences` - User preferences
- `tool-data` - Tool-specific data
- `activity-log` - Activity tracking data

### StorageOptions

```typescript
interface StorageOptions {
  encrypt?: boolean      // Enable encryption (default: false)
  compress?: boolean     // Enable compression (default: false)
  ttl?: number          // Time to live in milliseconds (optional)
}
```

### StorageItem

```typescript
interface StorageItem<T = unknown> {
  data: T
  metadata: {
    created: Date
    modified: Date
    version: string
    encrypted: boolean
    compressed: boolean
    ttl?: number
  }
}
```

## Usage

### Creating Storage Service

```typescript
import { createStorageService } from '@/lib/services/storage'

const storage = createStorageService()
```

Or use the default instance:

```typescript
import { storageService } from '@/lib/services/storage'
```

### Saving Data

```typescript
// Simple save
await storageService.save('my-key', { value: 'data' })

// Save with options
await storageService.save('my-key', { value: 'sensitive' }, {
  encrypt: true,
  compress: true,
  ttl: 3600000 // 1 hour
})
```

### Loading Data

```typescript
const data = await storageService.load<MyDataType>('my-key')

if (data === null) {
  console.log('No data found or expired')
} else {
  console.log('Loaded data:', data)
}
```

### Deleting Data

```typescript
await storageService.delete('my-key')
```

### Clearing All Data

```typescript
await storageService.clear()
```

### Listing Keys

```typescript
const keys = await storageService.keys()
console.log('Stored keys:', keys)
```

### Getting Storage Size

```typescript
const count = await storageService.size()
console.log(`Stored ${count} items`)
```

### Export Data

```typescript
// Export all data
const blob = await storageService.export()
const url = URL.createObjectURL(blob)

// Trigger download
const a = document.createElement('a')
a.href = url
a.download = 'astraa-data.json'
a.click()

// Export specific keys
const blob = await storageService.export(['user-preferences', 'tool-data'])
```

### Import Data

```typescript
const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

try {
  const imported = await storageService.import(file)
  console.log('Imported data:', imported)
} catch (error) {
  console.error('Import failed:', error)
}
```

## Implementation Details

### IndexedDB Storage

Primary storage mechanism using IndexedDB:
- Database name: `astraa-tools`
- Version: `1`
- Object store: `storage`
- Supports large data (up to browser limit, typically 50MB+)
- Asynchronous operations

### localStorage Fallback

Fallback when IndexedDB is unavailable:
- Key prefix: `astraa_`
- Limited to ~5-10MB depending on browser
- Synchronous API wrapped in async interface

### Encryption

**Note**: Current encryption uses simple XOR cipher for basic obfuscation only. Not cryptographically secure. See [Issue #7](https://github.com/puri-adityakumar/astraa/issues/7) for security improvements.

```typescript
// Enable encryption (use with caution)
await storageService.save('key', data, { encrypt: true })
```

### Compression

Simple JSON optimization for compression:

```typescript
await storageService.save('key', largeData, { compress: true })
```

### TTL (Time To Live)

Automatic expiration of stored data:

```typescript
// Data expires after 1 hour
await storageService.save('key', data, { ttl: 3600000 })

// Expired data returns null
const data = await storageService.load('key') // null after 1 hour
```

## Error Handling

```typescript
import { ValidationError } from '@/lib/core/validation'

try {
  await storageService.save('key', data)
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid data:', error.message)
  } else if (error.message.includes('quota')) {
    console.error('Storage quota exceeded')
  } else {
    console.error('Storage operation failed:', error)
  }
}
```

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Database not initialized` | IndexedDB failed to open | Check browser support, use incognito mode, or fallback to localStorage |
| `Failed to save data` | Storage quota exceeded | Clear old data or reduce data size |
| `Failed to parse stored data` | Corrupted data or invalid encryption | Delete the corrupted key |
| `Invalid import file format` | Wrong file format | Ensure file is valid JSON |

## Performance Considerations

1. **Batch Operations**: Use multiple saves in sequence rather than one-by-one
2. **Avoid Large Objects**: Split large datasets into smaller keys
3. **Use TTL**: Automatically clean up temporary data
4. **Index Strategy**: Keys are indexed for fast lookups
5. **Lazy Initialization**: Database opens on first use

## Migration Guide

### From localStorage

```typescript
// Old code
localStorage.setItem('key', JSON.stringify(data))
const data = JSON.parse(localStorage.getItem('key'))

// New code
await storageService.save('key', data)
const data = await storageService.load('key')
```

### From Custom IndexedDB

```typescript
// Old code
const db = await openDatabase()
const transaction = db.transaction(['store'], 'readwrite')
const store = transaction.objectStore('store')
store.put({ id: 'key', data: data })

// New code
await storageService.save('key', data)
```

## Testing

```typescript
import { createStorageService } from '@/lib/services/storage'

describe('Storage Service', () => {
  let storage: StorageService

  beforeEach(() => {
    storage = createStorageService()
  })

  afterEach(async () => {
    await storage.clear()
  })

  it('should save and load data', async () => {
    await storage.save('test', { value: 'data' })
    const loaded = await storage.load('test')
    expect(loaded).toEqual({ value: 'data' })
  })

  it('should handle TTL expiration', async () => {
    await storage.save('test', 'data', { ttl: 100 })
    await new Promise(resolve => setTimeout(resolve, 150))
    const loaded = await storage.load('test')
    expect(loaded).toBeNull()
  })
})
```

## See Also

- [Settings API](./settings-api.md)
- [Validation API](./validation-api.md)
- [Type Definitions](../../src/types/core.ts)
