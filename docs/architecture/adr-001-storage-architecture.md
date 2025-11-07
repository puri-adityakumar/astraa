# ADR-001: Storage Architecture

## Status
Accepted

## Context

Astraa needs to persist user data locally, including:
- User preferences (theme, accessibility settings)
- Tool configurations and defaults
- Tool-specific data (saved calculations, color palettes, etc.)
- Activity logs and usage statistics

Requirements:
1. **Privacy-first**: All data stays on user's device
2. **Reliable**: Data should persist across sessions
3. **Flexible**: Support various data types and sizes
4. **Fast**: Quick read/write operations
5. **Fallback**: Work on older browsers
6. **Export/Import**: Users can backup and restore data

## Decision

We decided to implement a **unified storage service** with the following characteristics:

### Primary Storage: IndexedDB

- **Why**: Supports large data (50MB+), structured storage, indexes, and async API
- **Use cases**: Primary storage for all user data
- **Advantages**:
  - Can store large amounts of data
  - Structured with indexes for fast queries
  - Asynchronous, doesn't block UI
  - Transactional operations
  - Wide browser support (95%+)

### Fallback Storage: localStorage

- **Why**: Universal browser support, simple API
- **Use cases**: Fallback when IndexedDB unavailable
- **Limitations**:
  - 5-10MB limit
  - Synchronous API
  - String-only storage (requires serialization)

### Unified Interface

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

### Features

1. **Encryption**: Optional simple encryption for sensitive data
   - Currently: XOR cipher (basic obfuscation)
   - Future: Web Crypto API with AES-GCM

2. **Compression**: Optional compression for large data
   - Currently: JSON optimization
   - Future: LZ-string compression

3. **TTL (Time To Live)**: Automatic expiration
   - Data automatically deleted after expiration
   - Checked on load operations

4. **Metadata**: Track data lifecycle
   ```typescript
   {
     created: Date
     modified: Date
     version: string
     encrypted: boolean
     compressed: boolean
     ttl?: number
   }
   ```

## Consequences

### Positive

1. **Consistent API**: Same interface regardless of underlying storage
2. **Type Safety**: Generic TypeScript interface with type checking
3. **Flexibility**: Can switch storage mechanisms without changing application code
4. **Progressive Enhancement**: Falls back gracefully on older browsers
5. **Privacy**: All data stays client-side
6. **User Control**: Export/import functionality gives users data ownership
7. **Performance**: IndexedDB provides fast, async operations

### Negative

1. **Complexity**: More complex than direct localStorage usage
2. **Browser Limits**: Still subject to browser storage quotas
3. **Testing**: Harder to test IndexedDB operations
4. **Sync Issues**: No cross-device synchronization (by design for privacy)
5. **Weak Encryption**: Current encryption is not cryptographically secure
6. **Race Conditions**: Potential concurrency issues (see Issue #11)

### Mitigation Strategies

1. **Testing**: Use mock implementations for unit tests
2. **Monitoring**: Track storage quota usage
3. **User Feedback**: Show storage usage in settings
4. **Error Handling**: Graceful degradation when quota exceeded
5. **Documentation**: Clear documentation of limitations
6. **Future Enhancement**: Implement proper encryption (Issue #7)

## Alternatives Considered

### Alternative 1: localStorage Only

**Pros**:
- Simple implementation
- Wide browser support
- Easy to test

**Cons**:
- Limited storage (5-10MB)
- Synchronous operations
- No structured data support

**Decision**: Rejected due to size limitations and performance concerns

### Alternative 2: Server-Side Storage

**Pros**:
- Unlimited storage
- Cross-device sync
- Backup and recovery

**Cons**:
- Privacy concerns
- Requires authentication
- Server costs
- Network dependency
- Latency

**Decision**: Rejected to maintain privacy-first approach

### Alternative 3: File System Access API

**Pros**:
- Large storage capacity
- Direct file access
- No browser limits

**Cons**:
- Limited browser support (~70%)
- Requires user permission
- Complex implementation
- File management overhead

**Decision**: Rejected due to limited browser support and UX concerns

### Alternative 4: Cache API

**Pros**:
- Service Worker integration
- Good for offline support

**Cons**:
- Designed for network resources, not app data
- Can be cleared by browser
- Complex lifecycle management

**Decision**: Rejected as not appropriate for user data storage

## Implementation Details

### Database Schema

**IndexedDB:**
- Database: `astraa-tools`
- Version: `1`
- Store: `storage`
- Key Path: `key`
- Indexes:
  - `modified` (non-unique) - for sorting by modification date

**localStorage:**
- Key Prefix: `astraa_`
- Format: `astraa_{key}`

### Storage Keys

Standardized key naming:
- `user-preferences` - User settings
- `tool-data` - Tool-specific data
- `activity-log` - Activity tracking
- `{toolId}-settings` - Per-tool settings
- `{toolId}-data-{id}` - Tool-specific saved data

### Quota Management

Monitor storage usage:
```typescript
// Check quota (where supported)
if (navigator.storage && navigator.storage.estimate) {
  const estimate = await navigator.storage.estimate()
  const percentUsed = (estimate.usage / estimate.quota) * 100
}
```

### Migration Strategy

For future storage format changes:

1. Version metadata in stored data
2. Migration functions for each version
3. Automatic migration on load
4. Fallback to defaults if migration fails

## Security Considerations

1. **Data Exposure**: Client-side storage can be accessed by user
   - Mitigation: Don't store truly sensitive data
   - Enhancement: Implement proper encryption (Issue #7)

2. **XSS Attacks**: Malicious scripts could access storage
   - Mitigation: Content Security Policy
   - Mitigation: Input validation and sanitization

3. **Storage Quota**: Malicious code could fill storage
   - Mitigation: Size limits and validation
   - Mitigation: Quota monitoring

## Performance Considerations

1. **Initialization**: Database opens on first use (lazy initialization)
2. **Concurrent Access**: Handled by IndexedDB transaction system
3. **Read Performance**: O(1) for key-based lookups with indexes
4. **Write Performance**: Batched writes for multiple operations
5. **Memory Usage**: Large objects handled efficiently by IndexedDB

## Testing Strategy

```typescript
// Mock storage service for testing
class MockStorageService implements StorageService {
  private store = new Map()

  async save(key: string, data: any) {
    this.store.set(key, data)
  }

  async load(key: string) {
    return this.store.get(key) ?? null
  }

  // ... other methods
}
```

## Future Enhancements

1. **Proper Encryption**: Implement Web Crypto API (Issue #7)
2. **Compression**: Add LZ-string compression
3. **Sync Option**: Optional cloud sync with user consent
4. **Backup Scheduling**: Automatic periodic backups
5. **Data Versioning**: Track data history
6. **Search Capability**: Full-text search across stored data
7. **Race Condition Fix**: Resolve initialization race condition (Issue #11)

## References

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Issue #7: Weak Encryption](https://github.com/puri-adityakumar/astraa/issues/7)
- [Issue #11: Race Condition](https://github.com/puri-adityakumar/astraa/issues/11)

## Related ADRs

- [ADR-002: Type System Design](./adr-002-type-system-design.md)
- [ADR-004: State Management](./adr-004-state-management.md)

---

**Last Updated**: 2025-11-07
**Authors**: Development Team
**Reviewers**: Architecture Team
