# Architecture Documentation

This directory contains Architecture Decision Records (ADRs) and architectural documentation for Astraa.

## What are ADRs?

Architecture Decision Records (ADRs) are documents that capture important architectural decisions made along with their context and consequences.

## Index of ADRs

- [ADR-001: Storage Architecture](./adr-001-storage-architecture.md)
- [ADR-002: Type System Design](./adr-002-type-system-design.md)
- [ADR-003: Component Structure](./adr-003-component-structure.md)
- [ADR-004: Client-Side State Management](./adr-004-state-management.md)

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface Layer                  │
│  (Next.js App Router, React Components, shadcn/ui)      │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Application Layer                       │
│  (Pages, Layouts, Route Handlers)                       │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   Business Logic Layer                   │
│  (Services, Utilities, Validation)                      │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                  Data Persistence Layer                  │
│  (IndexedDB, localStorage, External APIs)               │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Type System**: TypeScript 5.7

#### State Management
- **Client State**: Zustand
- **Server State**: React Server Components
- **Persistence**: IndexedDB / localStorage

#### Validation & Types
- **Runtime Validation**: Zod
- **Type Safety**: TypeScript strict mode
- **Form Handling**: React Hook Form

#### Build & Development
- **Build Tool**: Next.js (Turbopack in dev)
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler

### Directory Structure Philosophy

The project follows a hybrid structure combining Next.js conventions with clean architecture principles:

```
astraa/
├── app/                      # Next.js App Router (Routes & Layouts)
│   ├── games/               # Game applications
│   └── tools/               # Tool applications
│
├── components/              # React components (Legacy structure)
│   ├── ui/                 # UI components
│   └── [feature]/          # Feature-specific components
│
├── src/                     # Core application code (New structure)
│   ├── lib/                # Business logic & utilities
│   │   ├── core/          # Core functionality
│   │   ├── services/      # Service layer
│   │   └── utils/         # Utility functions
│   ├── types/              # TypeScript definitions
│   ├── config/             # Configuration
│   ├── hooks/              # Custom React hooks
│   └── components/         # New component structure
│
├── docs/                    # Documentation
│   ├── api/                # API documentation
│   ├── components/         # Component docs
│   └── architecture/       # Architecture docs
│
└── tests/                   # Test files
```

### Key Architectural Principles

1. **Separation of Concerns**
   - Clear boundaries between layers
   - Business logic separated from UI
   - Data access abstracted through services

2. **Type Safety**
   - TypeScript strict mode enabled
   - Runtime validation with Zod
   - No `any` types in production code

3. **Client-First Architecture**
   - Tools run entirely in browser
   - No server-side processing for tools
   - Privacy-focused (no data sent to server)

4. **Progressive Enhancement**
   - Core functionality works without JavaScript
   - Enhanced experience with JavaScript enabled
   - Graceful degradation for older browsers

5. **Performance**
   - Code splitting at route level
   - Lazy loading of heavy components
   - Optimized asset delivery
   - Client-side caching

## Core Subsystems

### Storage System

The storage system provides a unified interface for data persistence:

- **Primary**: IndexedDB for large, structured data
- **Fallback**: localStorage for older browsers
- **Features**: Encryption, compression, TTL
- **See**: [ADR-001: Storage Architecture](./adr-001-storage-architecture.md)

### Validation System

The validation system ensures data integrity:

- **Schema Definition**: Zod schemas
- **Runtime Validation**: Type-safe validation
- **Sanitization**: XSS prevention
- **See**: [ADR-002: Type System Design](./adr-002-type-system-design.md)

### Component System

The component system follows atomic design:

- **Atoms**: Basic UI elements (Button, Input)
- **Molecules**: Simple combinations (FormField)
- **Organisms**: Complex components (Calculator, HashTool)
- **Templates**: Page layouts
- **See**: [ADR-003: Component Structure](./adr-003-component-structure.md)

### State Management

State is managed at appropriate levels:

- **Local State**: useState for component-specific state
- **Shared State**: Zustand for cross-component state
- **Persisted State**: Storage service for persistent data
- **See**: [ADR-004: State Management](./adr-004-state-management.md)

## Design Patterns

### Service Pattern

Services encapsulate business logic and external dependencies:

```typescript
// Service definition
export interface StorageService {
  save<T>(key: string, data: T): Promise<void>
  load<T>(key: string): Promise<T | null>
  // ...
}

// Implementation
export class IndexedDBStorage implements StorageService {
  // Implementation details
}

// Usage
import { storageService } from '@/lib/services/storage'
await storageService.save('key', data)
```

### Repository Pattern

Data access is abstracted through repositories:

```typescript
export interface UserPreferencesRepository {
  get(): Promise<UserPreferences>
  update(preferences: Partial<UserPreferences>): Promise<void>
}
```

### Factory Pattern

Complex object creation is handled by factories:

```typescript
export function createStorageService(): StorageService {
  if (typeof indexedDB !== 'undefined') {
    return new IndexedDBStorage()
  }
  return new LocalStorageService()
}
```

## Security Architecture

### Client-Side Security

1. **Input Validation**: All user input validated and sanitized
2. **XSS Prevention**: Content sanitization before rendering
3. **CSP Headers**: Content Security Policy configured
4. **No Sensitive Data**: No secrets in client-side code

### Data Privacy

1. **Local Processing**: All tools run in browser
2. **No Tracking**: No analytics without consent
3. **Data Control**: Users control their data
4. **Export/Import**: Users can export their data

### Known Security Issues

See [Security Issues](https://github.com/puri-adityakumar/astraa/labels/security) for current security concerns and remediation plans.

## Performance Considerations

### Code Splitting

- Route-based splitting with Next.js App Router
- Dynamic imports for heavy components
- Lazy loading of tool implementations

### Caching Strategy

- Static assets cached indefinitely
- API responses cached with appropriate headers
- Storage service provides client-side caching

### Optimization Techniques

- Image optimization with Next.js Image component
- Font optimization with next/font
- CSS optimization with Tailwind JIT
- Bundle analysis to identify large dependencies

## Future Architecture Goals

1. **Improved Type Safety**: Eliminate remaining `any` types
2. **Better Testing**: Increase test coverage to 80%+
3. **Enhanced Security**: Implement proper encryption (see Issue #7)
4. **API Routes**: Add backend for sensitive operations (see Issue #6)
5. **Plugin System**: Allow third-party tool integrations
6. **Progressive Web App**: Add offline support and installability

## ADR Template

When creating new ADRs, use this template:

```markdown
# ADR-XXX: Title

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue we're facing?

## Decision
What did we decide?

## Consequences
What are the implications of this decision?

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

## Alternatives Considered
What other options did we consider?

## References
- Links to related issues, PRs, or documents
```

## Contributing to Architecture

When making architectural changes:

1. **Discuss First**: Open an issue or discussion
2. **Document Decision**: Create an ADR if significant
3. **Update Docs**: Update relevant documentation
4. **Communicate**: Share with team and get feedback

## Resources

- [Architecture Docs](./README.md)
- [API Documentation](../api/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [C4 Model](https://c4model.com/) - Inspiration for our diagrams
- [ADR Guidelines](https://github.com/joelparkerhenderson/architecture-decision-record)
