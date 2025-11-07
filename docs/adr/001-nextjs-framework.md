# ADR-001: Use Next.js 15 as Framework

Date: 2024-01-15

## Status

Accepted

## Context

We need to choose a React framework for building the Astraa utility tools suite. The application requires:
- Server-side rendering (SSR) for better SEO
- Static site generation (SSG) for performance
- File-based routing
- API routes for backend functionality
- Modern React features (Server Components, Suspense, etc.)
- Good developer experience
- Strong ecosystem and community support

## Decision

We will use **Next.js 15** (with App Router) as the primary framework for the Astraa application.

## Consequences

### Positive Consequences

1. **Excellent Performance**
   - Built-in optimizations (image optimization, code splitting)
   - Server Components reduce client-side JavaScript
   - Automatic static optimization

2. **Developer Experience**
   - File-based routing simplifies navigation
   - Hot reload and fast refresh
   - TypeScript support out of the box
   - Excellent documentation

3. **SEO Benefits**
   - Server-side rendering improves search engine visibility
   - Metadata API for managing page meta tags
   - Automatic sitemap generation

4. **Full-Stack Capabilities**
   - API routes for backend logic
   - Middleware support
   - Edge runtime support

5. **Modern React Features**
   - React Server Components
   - Streaming SSR
   - Suspense boundaries
   - Server Actions

6. **Deployment**
   - Seamless Vercel deployment
   - Support for other platforms (Netlify, AWS, etc.)
   - Edge network distribution

7. **Community and Ecosystem**
   - Large community
   - Extensive plugin ecosystem
   - Regular updates and improvements

### Negative Consequences

1. **Learning Curve**
   - App Router is newer and requires learning new patterns
   - Server vs Client Components mental model
   - Differences from Create React App

2. **Build Times**
   - Can be slower for large applications
   - Cold starts in development

3. **Framework Lock-in**
   - Tightly coupled to Next.js conventions
   - Migration to other frameworks would require significant refactoring

4. **Complexity**
   - More complex than simple React SPA
   - Additional concepts (layouts, loading states, error boundaries)

## Alternatives Considered

### 1. Create React App (CRA)
**Pros:**
- Simple setup
- No server-side complexity
- Familiar to many developers

**Cons:**
- No SSR/SSG
- Poor SEO out of the box
- Maintenance mode (no longer actively developed)
- Manual configuration needed for optimization

**Why rejected:** Lack of SSR/SSG and the project being in maintenance mode.

### 2. Remix
**Pros:**
- Excellent data loading patterns
- Progressive enhancement
- Great performance
- Active development

**Cons:**
- Smaller community than Next.js
- Fewer third-party integrations
- Less mature ecosystem

**Why rejected:** Smaller ecosystem and less familiarity in the team.

### 3. Gatsby
**Pros:**
- Excellent for static sites
- Rich plugin ecosystem
- GraphQL data layer

**Cons:**
- Build times for large sites
- Less suited for dynamic content
- Complexity of GraphQL layer

**Why rejected:** Overkill for our use case, longer build times.

### 4. Vite + React Router
**Pros:**
- Extremely fast development server
- Simple and flexible
- Modern build tooling

**Cons:**
- No SSR/SSG out of the box
- Manual setup for many features
- More configuration required

**Why rejected:** Lack of built-in SSR and would require more setup.

## Implementation Details

### App Router Structure
```
app/
├── layout.tsx           # Root layout
├── page.tsx            # Home page
├── tools/
│   ├── calculator/
│   │   └── page.tsx    # Calculator tool
│   ├── currency/
│   │   └── page.tsx    # Currency converter
│   └── ...
├── games/
│   └── ...
└── api/                # API routes
    └── ...
```

### Key Next.js Features Used

1. **App Router**: File-based routing with layouts
2. **Server Components**: Default for better performance
3. **Metadata API**: SEO optimization
4. **Image Optimization**: Automatic image optimization
5. **Font Optimization**: Google Fonts optimization
6. **API Routes**: Backend endpoints

### Configuration

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['allowed-domains.com'],
  },
  // Additional optimizations
}
```

## Migration Path

If we need to migrate away from Next.js in the future:

1. **To Remix**: Similar patterns, moderate effort
2. **To Vite SPA**: Remove SSR, extract components, high effort
3. **To Gatsby**: Similar React patterns, moderate effort

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router Documentation](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js vs Alternatives Comparison](https://vercel.com/blog/next-js-vs-gatsby-vs-remix)

## Review

This decision should be reviewed:
- If Next.js introduces breaking changes affecting our use case
- If a clearly superior alternative emerges
- If performance requirements change significantly
- Annually as part of tech stack review
