// Re-exported through a single-symbol module so the deferred import in
// instrumentation-client.ts emits a chunk that contains only the Replay
// recorder. Importing the "@sentry/nextjs" namespace would pull the whole SDK
// surface into that chunk.
export { replayIntegration } from "@sentry/nextjs";
