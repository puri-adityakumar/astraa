# Contributing to Astraa

Thank you for your interest in contributing to Astraa! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and professional in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information
- Personal or political attacks
- Any conduct that would be considered inappropriate in a professional setting

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/astraa.git
   cd astraa
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/puri-adityakumar/astraa.git
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Project Structure

```
astraa/
├── app/                    # Next.js app directory
│   ├── games/             # Game pages
│   └── tools/             # Tool pages
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── calculator/       # Calculator components
│   ├── currency/         # Currency converter components
│   └── ...
├── src/
│   ├── lib/              # Core library code
│   │   ├── core/        # Core business logic
│   │   ├── services/    # Service implementations
│   │   ├── tools/       # Tool utilities
│   │   └── utils/       # Utility functions
│   ├── types/            # TypeScript type definitions
│   ├── config/           # Configuration
│   ├── hooks/            # Custom React hooks
│   └── components/       # Additional components
├── docs/                  # Documentation
│   ├── api/              # API documentation
│   ├── components/       # Component documentation
│   └── architecture/     # Architecture docs
├── tests/                 # Test files
└── public/               # Static assets
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code (protected)
- `development` - Active development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Feature Branch

```bash
# Update your local development branch
git checkout development
git pull upstream development

# Create a new feature branch
git checkout -b feature/my-new-feature

# Make your changes and commit
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/my-new-feature
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types - use `unknown` with type guards instead
- Define interfaces for all data structures
- Use meaningful variable and function names

```typescript
// Good
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
}

function getUserPreferences(): UserPreferences {
  // ...
}

// Bad
function getPrefs(): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for prop types

```typescript
// Good
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  )
}

// Bad
export function Button(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)
- Hooks: `use-feature-name.ts` (e.g., `use-local-storage.ts`)
- Types: `kebab-case.ts` (e.g., `user-types.ts`)

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

**Key style rules:**
- 2 spaces for indentation
- Single quotes for strings
- No semicolons
- Trailing commas in multi-line structures
- Max line length: 100 characters

### Import Order

```typescript
// 1. React and Next.js imports
import React from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party imports
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal imports - absolute paths
import { Button } from '@/components/ui/button'
import { storageService } from '@/lib/services/storage'
import type { UserPreferences } from '@/types'

// 4. Relative imports
import { helper } from './utils'

// 5. Style imports
import './styles.css'
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(calculator): add scientific mode

Implemented scientific calculator with trigonometric functions,
logarithms, and exponential operations.

Closes #42

---

fix(storage): resolve race condition in IndexedDB initialization

Added proper synchronization to prevent multiple initialization attempts.

Fixes #11

---

docs(api): add storage API documentation

Created comprehensive documentation for the storage service API,
including examples and best practices.
```

### Rules

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep first line under 72 characters
- Reference issues and pull requests in footer
- Add breaking changes in footer with `BREAKING CHANGE:` prefix

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest development:
   ```bash
   git checkout development
   git pull upstream development
   git checkout your-feature-branch
   git rebase development
   ```

2. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   # Run any relevant tests
   ```

3. **Update documentation** if needed

4. **Write clear commit messages** following guidelines above

### Submitting a PR

1. Push your branch to your fork:
   ```bash
   git push origin feature/my-feature
   ```

2. Open a pull request to `development` branch

3. Fill out the PR template completely

4. Link related issues using keywords:
   - `Closes #123` - Closes the issue
   - `Fixes #123` - Fixes the bug
   - `Relates to #123` - Related but doesn't close

### PR Title Format

Follow the same format as commit messages:

```
feat(calculator): add scientific mode
fix(storage): resolve IndexedDB race condition
docs(api): add validation API documentation
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] All tests pass
- [ ] Linter passes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
- [ ] All tests pass
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. No merge conflicts
4. Address all review comments
5. Maintainer will merge when approved

## Testing Guidelines

### Writing Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { storageService } from '@/lib/services/storage'

describe('StorageService', () => {
  beforeEach(async () => {
    await storageService.clear()
  })

  afterEach(async () => {
    await storageService.clear()
  })

  it('should save and load data', async () => {
    const testData = { value: 'test' }
    await storageService.save('test-key', testData)
    const loaded = await storageService.load('test-key')
    expect(loaded).toEqual(testData)
  })

  it('should handle non-existent keys', async () => {
    const loaded = await storageService.load('non-existent')
    expect(loaded).toBeNull()
  })
})
```

### Test Coverage

- Aim for 80%+ code coverage
- Test happy paths and error cases
- Test edge cases and boundary conditions
- Mock external dependencies

## Documentation

### Code Comments

```typescript
/**
 * Validates user input and saves to storage
 *
 * @param key - Storage key for the data
 * @param data - User data to validate and save
 * @returns Promise that resolves when saved
 * @throws {ValidationError} When data is invalid
 *
 * @example
 * ```typescript
 * await saveUserData('preferences', { theme: 'dark' })
 * ```
 */
export async function saveUserData(key: string, data: unknown): Promise<void> {
  const validData = validateData(userPreferencesSchema, data)
  await storageService.save(key, validData)
}
```

### Updating Documentation

- Update relevant documentation when changing features
- Add JSDoc comments for public APIs
- Update README if adding new features
- Add examples for complex functionality

## Issue Reporting

### Bug Reports

Use the bug report template and include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Numbered steps to reproduce
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Browser, OS, version
6. **Screenshots**: If applicable
7. **Additional Context**: Any other relevant information

### Feature Requests

Use the feature request template and include:

1. **Description**: Clear description of the feature
2. **Motivation**: Why is this feature needed?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Other solutions considered
5. **Additional Context**: Mockups, examples, etc.

## Questions and Support

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check [docs/](../docs/) for detailed guides

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project README

Thank you for contributing to Astraa! 🚀
