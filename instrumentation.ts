// RETIRED (2026-11-22, issue #105): Sentry is disabled for users. The server
// and edge instrumentation below is commented out rather than deleted so it
// can be restored by uncommenting it (the @sentry/nextjs dependency stays
// installed). See sentry.server.config.ts and sentry.edge.config.ts.
//
// import * as Sentry from "@sentry/nextjs";
//
// export async function register() {
//   if (process.env.NEXT_RUNTIME === "nodejs") {
//     await import("./sentry.server.config");
//   }
//
//   if (process.env.NEXT_RUNTIME === "edge") {
//     await import("./sentry.edge.config");
//   }
// }
//
// export const onRequestError = Sentry.captureRequestError;
