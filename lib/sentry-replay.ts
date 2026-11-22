// Re-exported through a single-symbol module so the deferred import in
// instrumentation-client.ts emits a chunk that contains only the Replay
// recorder. Importing the "@sentry/nextjs" namespace would pull the whole SDK
// surface into that chunk.
//
// Kept for restoration while Sentry is retired (issue #105): nothing imports
// this module today.
export { replayIntegration } from "@sentry/nextjs";
