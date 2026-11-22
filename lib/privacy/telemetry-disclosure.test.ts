import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(relativePath: string): string {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const SENTRY_CONFIG_FILES = [
  "instrumentation-client.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
];

describe("sentry configuration contract (issue #96)", () => {
  it.each(SENTRY_CONFIG_FILES)("disables PII in %s", (file) => {
    const config = read(file);
    expect(config).toMatch(/sendDefaultPii\s*:\s*false/);
    expect(config).not.toMatch(/sendDefaultPii\s*:\s*true/);
  });

  it("masks all text and blocks media in the client session replay", () => {
    const config = read("instrumentation-client.ts");
    expect(config).toMatch(/replayIntegration\s*\(/);
    expect(config).toMatch(/maskAllText\s*:\s*true/);
    expect(config).toMatch(/blockAllMedia\s*:\s*true/);
    expect(config).not.toMatch(/maskAllText\s*:\s*false/);
    expect(config).not.toMatch(/blockAllMedia\s*:\s*false/);
  });

  it("keeps replay sampling finite instead of recording every session", () => {
    const config = read("instrumentation-client.ts");
    expect(config).toMatch(/replaysSessionSampleRate\s*:\s*0\.1/);
    expect(config).not.toMatch(/replaysSessionSampleRate\s*:\s*1(\.0)?\b/);
  });
});

describe("privacy policy disclosure contract (issue #96)", () => {
  const policy = read("app/(site)/privacy/privacy-policy.md");

  it("names Sentry and the data it receives", () => {
    expect(policy).toMatch(/Sentry/);
    expect(policy).toMatch(/error report/i);
    expect(policy).toMatch(/sendDefaultPii/i);
  });

  it("discloses session replay and its masking", () => {
    expect(policy).toMatch(/Session Replay/i);
    expect(policy).toMatch(/mask/i);
    expect(policy).toMatch(/block/i);
  });

  it("discloses that replay is off on the secret-handling tools", () => {
    expect(policy).toMatch(/Password Generator/i);
    expect(policy).toMatch(/Hash Generator/i);
    expect(policy).toMatch(/Text Generator/i);
  });

  it("discloses Vercel Analytics and Speed Insights", () => {
    expect(policy).toMatch(/Vercel Web Analytics/i);
    expect(policy).toMatch(/Speed Insights/i);
  });

  it("discloses the visitor counter and its deduplication cookie", () => {
    expect(policy).toMatch(/astraa_visited/);
    expect(policy).toMatch(/Visitor Counter/i);
  });
});
