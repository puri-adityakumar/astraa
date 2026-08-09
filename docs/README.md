# Astraa documentation

This index connects Astraa's public technical references without duplicating their source
material or the repository's contributor procedures.

- [Architecture](./ARCHITECTURE.md): rendering, state, remote data, privacy, and quality boundaries.
- [Components](./COMPONENTS.md): composition and component-level conventions.
- [Server interfaces](./API.md): rate routes, text action, contributors, and client caching.
- [Development](./DEVELOPMENT.md): setup, workflows, tests, environment, and contribution gates.
- [Performance](./PERFORMANCE.md): repeatable mobile lab profile, current medians, and follow-ups.
- [SEO](./SEO.md): search-data limitations, technical scope, and post-deployment checks.

## Quick start

```bash
npm ci
cp .env.sample .env.local
npm run dev
```

Most tools work without provider credentials. Crypto rates and AI-generated text
need their server-side variables to call their respective providers.

## Technology

| Area                | Choice                                                      |
| ------------------- | ----------------------------------------------------------- |
| Framework           | Next.js App Router, React, TypeScript                       |
| Styling             | Tailwind CSS, Radix-based local primitives, Geist           |
| Motion              | Framer Motion with reduced-motion support                   |
| Focused state       | Zustand with IndexedDB/localStorage adapter                 |
| Tests               | Vitest, Playwright, axe-core                                |
| Static checks       | TypeScript, ESLint, Knip                                    |
| Monitoring          | Optional sanitized Sentry, Vercel Analytics, Speed Insights |
| Server cache/limits | Next fetch cache, React cache, optional Upstash Redis       |

## Environment variables

| Variable                                                    | Required           | Purpose                                         |
| ----------------------------------------------------------- | ------------------ | ----------------------------------------------- |
| `OPENROUTER_API_KEY`                                        | For AI text        | Server-only OpenRouter credential               |
| `COINGECKO_API_KEY`                                         | For crypto rates   | Server-only CoinGecko credential                |
| `KV_REST_API_URL`                                           | Production AI text | Upstash REST endpoint                           |
| `KV_REST_API_TOKEN`                                         | Production AI text | Upstash REST credential                         |
| `RATE_LIMIT_SALT`                                           | Production AI text | Secret salt for anonymous rate-limit identities |
| `SENTRY_DSN` / `SENTRY_ENVIRONMENT`                         | Optional           | Server/edge error monitoring                    |
| `NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Optional           | Client error monitoring configuration           |
| `SENTRY_AUTH_TOKEN`                                         | Optional CI only   | Source-map upload during builds                 |
| `ASTRAA_ENABLE_ANALYTICS`                                   | Optional           | Set to `false` to omit Vercel telemetry         |

Use `.env.sample` as the source of truth and never commit real secrets.

## Contributor procedures

Human issue, pull-request, review, and release policy lives in the
[contribution guide](https://github.com/puri-adityakumar/astraa/blob/development/CONTRIBUTING.md).
Repository-owned coding-agent procedures live in the tracked
[feature workflow](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-feature-workflow/SKILL.md),
[architecture](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-architecture/SKILL.md),
and
[code-quality](https://github.com/puri-adityakumar/astraa/blob/development/.agents/skills/astraa-code-quality/SKILL.md)
skills.
