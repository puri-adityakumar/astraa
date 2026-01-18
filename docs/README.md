# Astraa Documentation

A modern, browser-based utility tools and games suite built with Next.js 15, TypeScript, and React 19.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Documentation Index](#documentation-index)

## Overview

Astraa provides an integrated platform of developer and creator utilities that run entirely in the browser. No backend processing required for most features.

**Key Features:**
- Password, hash, and text generators
- Currency and cryptocurrency converters
- Image resizer and unit converter
- Calculator and developer tools
- Browser-based games
- Dark/light theme support
- Activity tracking dashboard
- Keyboard navigation (cmd+k)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/puri-adityakumar/astraa.git
cd astraa

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Installation

### Prerequisites

- Node.js 18.17 or later
- npm 9.0 or later

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/puri-adityakumar/astraa.git

# 2. Navigate to project directory
cd astraa

# 3. Install dependencies
npm install

# 4. Copy environment variables (optional)
cp .env.sample .env.local

# 5. Configure environment variables
# OPENROUTER_API_KEY - Required for AI text generation
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Optional | API key for AI-powered text generation |

## Running the Application

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:3000` with hot reload.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, diagrams, and data flow |
| [API.md](./API.md) | API integrations and external services |
| [COMPONENTS.md](./COMPONENTS.md) | Component hierarchy, hooks, and usage |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development guidelines and workflows |

## Tech Stack

| Category | Technologies |
|----------|--------------|
| Framework | Next.js 16, React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS 3.4, Framer Motion |
| UI Components | Radix UI, Shadcn/UI |
| State | Zustand 5, React Context |
| Forms | React Hook Form, Zod 4 |
| Database | Upstash Redis |
| Monitoring | Sentry, Vercel Analytics |

## License

MIT License - see [LICENSE](../LICENSE) for details.
