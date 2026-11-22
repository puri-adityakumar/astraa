import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

/**
 * Return the file's active source: block comments removed and whole-line
 * comments dropped, so only uncommented code remains for assertion.
 */
function activeSource(relativePath: string): string {
  const raw = readFileSync(path.join(ROOT, relativePath), "utf8");
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

/**
 * Files whose Sentry integration is retired: every active Sentry statement is
 * commented out, but the commented setup stays on disk so it can be restored.
 */
const RETIRED_SENTRY_FILES = [
  "instrumentation-client.ts",
  "instrumentation.ts",
  "sentry.server.config.ts",
  "sentry.edge.config.ts",
  "next.config.js",
  "app/error.tsx",
  "app/global-error.tsx",
  "lib/snippet-generator/use-export-actions.ts",
];

describe("Sentry retirement (issue #105)", () => {
  it("keeps every retired Sentry file on disk with its commented setup", () => {
    for (const file of RETIRED_SENTRY_FILES) {
      const raw = readFileSync(path.join(ROOT, file), "utf8");
      expect(raw.length, `${file} should still exist`).toBeGreaterThan(0);
      expect(raw, `${file} should keep the Sentry setup in place as comments`).toMatch(
        /sentry/i,
      );
    }
  });

  it("activates no Sentry code in any retired file", () => {
    for (const file of RETIRED_SENTRY_FILES) {
      const active = activeSource(file);
      expect(active, `${file} must not import @sentry/nextjs`).not.toMatch(
        /@sentry\/nextjs/,
      );
      expect(active, `${file} must not call Sentry APIs`).not.toMatch(/Sentry\./);
      expect(active, `${file} must not wrap the build with Sentry`).not.toMatch(
        /withSentryConfig/,
      );
    }
  });

  it("does not import the deferred replay module in instrumentation-client.ts", () => {
    expect(activeSource("instrumentation-client.ts")).not.toMatch(
      /lib\/sentry-replay/,
    );
  });

  it("keeps the Sentry dependency installed for restoration", () => {
    const pkg = JSON.parse(
      readFileSync(path.join(ROOT, "package.json"), "utf8"),
    ) as { dependencies: Record<string, string> };
    expect(pkg.dependencies["@sentry/nextjs"]).toBeTruthy();
  });

  it("keeps Vercel Analytics mounted in the root layout for both flavours", () => {
    const layout = activeSource("app/layout.tsx");
    expect(layout).toMatch(/import \{ Analytics \} from "@vercel\/analytics\/next"/);
    expect(layout).toMatch(/<Analytics\s*\/>/);
  });
});
