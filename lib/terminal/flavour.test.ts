import { describe, expect, it } from "vitest";
import { isTerminalCapablePath } from "@/lib/terminal/flavour";

describe("isTerminalCapablePath", () => {
  it.each(["/", "/tools", "/tools/"])("accepts the home and tools index %s", (path) => {
    expect(isTerminalCapablePath(path)).toBe(true);
  });

  it("accepts a registered tool slug", () => {
    expect(isTerminalCapablePath("/tools/calculator")).toBe(true);
  });

  it("accepts a registered tool slug with a trailing slash", () => {
    expect(isTerminalCapablePath("/tools/calculator/")).toBe(true);
  });

  it("rejects an unregistered tool slug", () => {
    expect(isTerminalCapablePath("/tools/hash")).toBe(false);
  });

  it("rejects an unknown tool slug", () => {
    expect(isTerminalCapablePath("/tools/nope")).toBe(false);
  });

  it.each(["/explore", "/contribute", "/privacy", "/games", "/games/chess"])(
    "rejects the always-legacy route %s",
    (path) => {
      expect(isTerminalCapablePath(path)).toBe(false);
    },
  );

  it.each(["/tool", "/toolsfoo", "/tools/ Calculator"])(
    "rejects the near-miss path %s",
    (path) => {
      expect(isTerminalCapablePath(path)).toBe(false);
    },
  );
});
