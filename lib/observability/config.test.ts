import { describe, expect, it } from "vitest";

import { getSentryTraceSampleRate, isSentryEnabled } from "./config";

describe("Sentry privacy defaults", () => {
  it("requires both DSN and an explicit environment", () => {
    expect(isSentryEnabled("https://public@example.com/1", "production")).toBe(true);
    expect(isSentryEnabled(undefined, "production")).toBe(false);
    expect(isSentryEnabled("https://public@example.com/1", undefined)).toBe(false);
  });

  it("uses low environment-aware trace samples", () => {
    expect(getSentryTraceSampleRate("production")).toBe(0.05);
    expect(getSentryTraceSampleRate("preview")).toBe(0.01);
    expect(getSentryTraceSampleRate("development")).toBe(0);
  });
});
