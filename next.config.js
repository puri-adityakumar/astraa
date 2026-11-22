/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: false },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${isProduction ? " 'wasm-unsafe-eval'" : " 'unsafe-eval'"}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: blob: https:${isProduction ? "" : " http:"}`,
      "font-src 'self' data:",
      "media-src 'self' blob: https://stream.nightride.fm",
      "worker-src 'self' blob:",
      "frame-src 'self' blob: https:",
      `connect-src 'self' https://api.coingecko.com https://api.exchangerate-api.com https://api.github.com https://cdn.jsdelivr.net https://o4510567847952384.ingest.de.sentry.io https://vitals.vercel-insights.com https://va.vercel-scripts.com${isProduction ? "" : " http://localhost:* ws://localhost:*"}`,
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;


// RETIRED (2026-11-22, issue #105): Sentry is disabled for users, so the build
// no longer wraps the config with source-map uploads or Vercel cron
// monitoring. The wrapper is commented out rather than deleted so it can be
// restored by uncommenting it.
// Injected content via Sentry wizard below
//
// const { withSentryConfig } = require("@sentry/nextjs");
//
// module.exports = withSentryConfig(module.exports, {
//   // For all available options, see:
//   // https://www.npmjs.com/package/@sentry/webpack-plugin#options
//
//   org: "astraa",
//   project: "astraadotetch",
//
//   // Only print logs for uploading source maps in CI
//   silent: !process.env.CI,
//
//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
//
//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,
//
//   // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//   // This can increase your server load as well as your hosting bill.
//   // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//   // side errors will fail.
//   // tunnelRoute: "/monitoring",
//
//   webpack: {
//     // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//     // See the following for more information:
//     // https://docs.sentry.io/product/crons/
//     // https://vercel.com/docs/cron-jobs
//     automaticVercelMonitors: true,
//
//     // Tree-shaking options for reducing bundle size
//     treeshake: {
//       // Automatically tree-shake Sentry logger statements to reduce bundle size
//       removeDebugLogging: true,
//     },
//   },
// });