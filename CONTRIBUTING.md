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

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks, dependency updates, etc. |
| `ci` | CI/CD configuration changes |
| `build` | Build system or external dependency changes |

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

# Copy environment variables
cp .env.sample .env.local

# Start development server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ENV` | Yes | `dev` shows WIP features for testing, `prod` shows "Coming Soon" cards |
| `OPENROUTER_API_KEY` | Optional | API key for AI text generation ([get one here](https://openrouter.ai/keys)) |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry error tracking token |

### Available Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint — run this before submitting a PR
```

### No Test Suite

There is no automated test suite. Use manual testing during development — verify your changes work across mobile/desktop and dark/light themes.

## Using AI Agents (Claude Code)

This project includes a `CLAUDE.md` file that provides context to AI coding agents like [Claude Code](https://claude.ai/code).

**If you use Claude Code or similar AI agents to contribute:**

1. Run `/init` at the start of your session so the agent reads `CLAUDE.md` and understands the project conventions (code style, architecture patterns, naming, etc.)
2. The agent will follow the project's double-quote, semicolon, 2-space indent formatting automatically
3. Verify AI-generated code still follows the server page → client component pattern described below
4. Always review AI output before committing — don't blindly trust generated code

## Project Structure

```
astraa/
├── app/                 # Next.js App Router pages
│   ├── tools/          # Tool pages (server components)
│   ├── games/          # Game pages
│   └── api/            # API routes
├── components/         # React components (client components)
│   └── ui/             # Shadcn/UI primitives
├── lib/                # Utilities, logic, stores
│   ├── stores/         # Zustand stores (IndexedDB-persisted)
│   ├── animations/     # Framer Motion variants and hooks
│   └── games/          # Game logic hooks
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── middleware.ts        # Edge middleware (visitor counting)
```

### Core Architecture Pattern

Server component pages render client components — this is the standard for all tools and games:

```
app/tools/[tool]/page.tsx          → Server component (metadata + renders client)
components/[tool]/[tool]-client.tsx → Client component ("use client", UI logic)
lib/[tool]/                        → Pure logic, no React
```

## Adding a New Tool

1. Register in `lib/tools.ts` — add to appropriate `ToolCategory` with `name`, `description`, `path`, `icon`
2. Create `app/tools/[tool-name]/page.tsx` with metadata
3. Create `components/[tool-name]/[tool-name]-client.tsx` with `"use client"`
4. Add tool logic to `lib/[tool-name]/` if needed

## Development Tips

- **State persistence** uses IndexedDB (primary) with localStorage fallback — not plain localStorage
- **WIP features** are controlled by `NEXT_PUBLIC_ENV` in `.env.local` — set to `dev` to see them
- **Animations** must respect `useReducedMotion()` from `lib/animations/hooks.ts`
- **Error handling** — use `getUserFriendlyError()` and `logError()` from `lib/error-handler.ts`, not raw try/catch with console.error
- **Styling** — use `cn()` from `lib/utils` for conditional Tailwind classes, not string concatenation
- **No `any`** — TypeScript strict mode is on, prefer `unknown` and narrow types

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
