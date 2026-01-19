# Contributing to astraa

Thank you for your interest in contributing to astraa! We appreciate your help in making this project better.

## Before You Start

1. **Find or create an issue** - Search [existing issues](https://github.com/puri-adityakumar/astraa/issues) first
2. **Wait to be assigned** - Comment on the issue and wait for assignment before starting work
   - Assignment priority: Issue creator first, then first volunteer commenter
   - **Submitting a PR without assignment will result in rejection**
3. **Discuss approach** - Align on implementation details before coding

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear and consistent commit history.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only changes                              |
| `style`    | Code style changes (formatting, semicolons, etc.)       |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvements                                |
| `test`     | Adding or updating tests                                |
| `chore`    | Maintenance tasks, dependency updates, etc.             |
| `ci`       | CI/CD configuration changes                             |
| `build`    | Build system or external dependency changes             |

### Examples

```bash
feat(calculator): add scientific mode
fix(image-resizer): correct aspect ratio calculation
docs: update README with new features
style(navbar): fix spacing issues
refactor(tools): simplify tool registration logic
chore: update dependencies
```

### Rules

- Use lowercase for type and description
- Keep the first line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Don't end the description with a period

## Pull Request Requirements

### Must Have

- **Target branch** - All PRs must be made to the `development` branch
- **Linked issue** - Reference the issue in your PR (e.g., "Closes #123")
- **Valid title** - Use Conventional Commits format (see above)
- **Passing checks** - All CI checks must pass

### Standards

- **Surgical PRs** - One clear objective per PR
- **Clean code** - Elegant, well-reasoned implementation
- **Meaningful changes** - No low-effort, cosmetic, or trivial edits
- **No duplicate work** - Check if someone else already opened a PR

## Local Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/puri-adityakumar/astraa.git
cd astraa

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
astraa/
├── app/                 # Next.js app directory
│   ├── tools/          # Tool pages
│   ├── games/          # Game pages
│   └── ...
├── components/         # React components
├── lib/                # Utility functions and helpers
└── public/             # Static assets
```

## Adding a New Tool

1. Create a new directory in `app/tools/[tool-name]/`
2. Add the tool's `page.tsx`
3. Create components in `components/[tool-name]/` if needed
4. Register the tool in `lib/tools.ts`

## Review Process

- Maintainers will review your PR
- Address feedback promptly - PRs with unaddressed comments may be closed
- Feel free to recreate a PR once issues are resolved

## Release Process

### Merging Development to Main

When merging the `development` branch to `main`, follow this convention:

**PR Title Format:**

```
release(v<VERSION>): merge development to main
```

**Examples:**

- `release(v0.1.0): merge development to main`
- `release(v0.2.0): merge development to main`
- `release(v1.0.0): merge development to main`

**PR Description Template:**

```markdown
## Version: v<VERSION>

### Summary

Merging development branch to main for release v<VERSION>

### Key Changes

- List major changes (features, fixes, improvements)

### Checklist

- [ ] All CI checks passing
- [ ] Tested on mobile and desktop
- [ ] Build successful
- [ ] Documentation updated (if needed)
```

**Versioning:**

- Use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
- `v0.x.x` = Pre-release (alpha/beta)
- `v1.0.0` = First stable production release
- Increment:
  - `MAJOR` for breaking changes
  - `MINOR` for new features
  - `PATCH` for bug fixes

## Getting Help

- **Telegram**: [astraadottech](https://t.me/astraadottech)
- **X (Twitter)**: [@astraadottech](https://x.com/astraadottech)
- **Email**: contact@astraa.tech

Thank you for contributing to astraa! 🚀
