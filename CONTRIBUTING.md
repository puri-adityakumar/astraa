# Contributing to Astraa

Thank you for your interest in contributing to Astraa! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender identity, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the Repository**
   ```bash
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR-USERNAME/astraa.git
   cd astraa
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/puri-adityakumar/astraa.git
   git fetch upstream
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   Navigate to `http://localhost:3000`

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Error Lens
- TypeScript Error Translator

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

```bash
# Feature branches
feature/add-dark-mode
feature/currency-converter

# Bug fixes
fix/calculator-division-by-zero
fix/memory-leak-in-converter

# Documentation
docs/api-documentation
docs/contributing-guide

# Refactoring
refactor/extract-api-utils
refactor/simplify-state-management

# Chores (dependencies, config, etc.)
chore/update-dependencies
chore/configure-eslint
```

### Development Process

1. **Create a Branch**
   ```bash
   git checkout development
   git pull upstream development
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   See [commit guidelines](#commit-guidelines) for message format.

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR from your fork to `development` branch
   - Fill out the PR template
   - Link related issues

### Keeping Your Fork Updated

```bash
git checkout development
git fetch upstream
git merge upstream/development
git push origin development
```

## Coding Standards

### TypeScript

- **Always use TypeScript**: No plain JavaScript files
- **Strict type checking**: Enable in `tsconfig.json`
- **Avoid `any` type**: Use proper types or `unknown` (see [Issue #15](https://github.com/puri-adityakumar/astraa/issues/15))
- **Use type inference**: Let TypeScript infer types when obvious

**Examples**:

```typescript
// ✅ GOOD
interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
}

function updatePreferences(prefs: UserPreferences): void {
  // Implementation
}

// ❌ BAD
function updatePreferences(prefs: any) {
  // Implementation
}
```

### Code Style

We use ESLint and Prettier for code formatting.

**Run linting**:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Key rules**:
- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Max line length: 100 characters
- Use semicolons

### Component Guidelines

1. **Use Function Components**
   ```typescript
   // ✅ GOOD
   export function MyComponent() {
     return <div>Hello</div>
   }

   // ❌ BAD
   export class MyComponent extends React.Component {
     render() {
       return <div>Hello</div>
     }
   }
   ```

2. **Props Interface**
   ```typescript
   interface ButtonProps {
     label: string
     onClick: () => void
     variant?: 'primary' | 'secondary'
     disabled?: boolean
   }

   export function Button({
     label,
     onClick,
     variant = 'primary',
     disabled = false
   }: ButtonProps) {
     // Implementation
   }
   ```

3. **Use Composition**
   ```typescript
   // ✅ GOOD - Composition
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>Content</CardContent>
   </Card>

   // ❌ BAD - Props drilling
   <Card title="Title" content="Content" />
   ```

4. **Custom Hooks for Logic**
   ```typescript
   // hooks/use-currency-converter.ts
   export function useCurrencyConverter() {
     const [rate, setRate] = useState(1)
     const [loading, setLoading] = useState(false)

     useEffect(() => {
       // Fetch rate
     }, [])

     return { rate, loading }
   }
   ```

### File Organization

```typescript
// 1. Imports - External libraries first
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Imports - Internal utilities
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

// 3. Imports - Components
import { Button } from '@/components/ui/button'

// 4. Type definitions
interface ComponentProps {
  // ...
}

// 5. Component definition
export function Component() {
  // Implementation
}
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `UserProfile`)
- **Files**: kebab-case (`user-profile.tsx`, `api-utils.ts`)
- **Functions**: camelCase (`getUserData`, `handleClick`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Interfaces**: PascalCase with descriptive names (`UserData`, `ApiResponse`)
- **Hooks**: camelCase starting with `use` (`useAuth`, `useFetch`)

### Comments

- **JSDoc for public APIs**:
  ```typescript
  /**
   * Fetches the current price of a cryptocurrency
   * @param cryptoId - The CoinGecko ID of the cryptocurrency
   * @param currency - The target currency code
   * @returns The current price
   * @throws {ApiError} If the API request fails
   */
  export async function getCryptoPrice(
    cryptoId: string,
    currency: string
  ): Promise<number> {
    // Implementation
  }
  ```

- **Inline comments for complex logic**:
  ```typescript
  // Calculate the weighted average using the formula:
  // avg = (sum of (value * weight)) / (sum of weights)
  const average = values.reduce((acc, val, idx) =>
    acc + val * weights[idx], 0
  ) / weights.reduce((a, b) => a + b, 0)
  ```

- **Avoid obvious comments**:
  ```typescript
  // ❌ BAD
  // Increment counter by 1
  counter++

  // ✅ GOOD
  // Reset counter after batch processing completes
  counter = 0
  ```

### Accessibility

All components must be accessible:

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

See [Issue #20](https://github.com/puri-adityakumar/astraa/issues/20) for detailed accessibility guidelines.

### Security

- **Never commit API keys** (see [Issue #14](https://github.com/puri-adityakumar/astraa/issues/14))
- **Validate all inputs** (see [Issue #18](https://github.com/puri-adityakumar/astraa/issues/18))
- **Sanitize user data** before rendering
- **Use environment variables** for sensitive data
- **Implement proper error handling** (see [Issue #17](https://github.com/puri-adityakumar/astraa/issues/17))

## Testing Guidelines

### Test Coverage

All new features and bug fixes must include tests:

- **Unit tests**: For utilities and pure functions (90%+ coverage)
- **Component tests**: For React components (80%+ coverage)
- **Integration tests**: For feature workflows (70%+ coverage)

### Writing Tests

Use Vitest and React Testing Library:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- button.test.tsx
```

See [Issue #19](https://github.com/puri-adityakumar/astraa/issues/19) for comprehensive testing strategy.

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
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Simple feature
feat: add dark mode toggle

# Feature with scope
feat(calculator): add scientific mode

# Bug fix
fix(api): handle network timeout errors

# Breaking change
feat(auth)!: change authentication method

BREAKING CHANGE: Authentication now requires OAuth 2.0
```

### Best Practices

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep subject line under 50 characters
- Add detailed description in body if needed
- Reference issues in footer

```bash
feat(currency): add crypto currency converter

Implement cryptocurrency conversion using CoinGecko API.
Supports major cryptocurrencies and multiple fiat currencies.

Closes #42
Refs #38, #41
```

## Pull Request Process

### Before Creating a PR

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with `development`

### PR Title Format

Follow the same format as commit messages:

```
feat(calculator): add scientific mode
fix(api): handle timeout errors
docs: update contributing guidelines
```

### PR Description Template

When creating a PR, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to break)
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Related Issues
Closes #123
Refs #456

## Testing
Describe the tests you ran and how to reproduce them.

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI/CD runs tests, linting, and builds
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, a maintainer will merge your PR

### Addressing Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "fix: address PR feedback"
git push origin feature/your-feature-name
```

## Issue Guidelines

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check if the issue is already fixed in `development` branch
- Gather all relevant information (error messages, screenshots, etc.)

### Issue Types

#### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome 120, Firefox 121]
- Node version: [e.g., 18.17.0]
- App version: [e.g., 0.1.0]

**Additional context**
Any other relevant information.
```

#### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions or features you've considered.

**Additional context**
Any other relevant information or screenshots.
```

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good-first-issue`: Good for newcomers
- `help-wanted`: Extra attention is needed
- `priority-high`: High priority
- `priority-low`: Low priority
- `security`: Security vulnerability
- `code-quality`: Code quality improvements

## Documentation

### When to Update Documentation

Update documentation when you:
- Add new features
- Change APIs
- Fix bugs that affect usage
- Add new configuration options
- Change development workflow

### Documentation Locations

- **README.md**: Project overview and quick start
- **CONTRIBUTING.md**: This file
- **docs/api/**: API documentation
- **docs/components/**: Component documentation
- **docs/adr/**: Architecture decisions
- **Component JSDoc**: Inline documentation

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Link to related documentation
- Keep examples up to date

## Community

### Getting Help

- **GitHub Discussions**: Ask questions and discuss features
- **GitHub Issues**: Report bugs and request features
- **Discord** (if available): Real-time chat with community

### Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README (for significant contributions)

## Thank You!

Your contributions make Astraa better for everyone. We appreciate your time and effort! 🎉

## Questions?

If you have questions not covered in this guide, please:
1. Check existing documentation
2. Search GitHub Discussions
3. Open a new Discussion
4. Reach out to maintainers

---

**Happy Contributing!** 🚀
