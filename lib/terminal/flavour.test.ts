import { describe, expect, it } from "vitest";
import {
  isTerminalCapablePath,
  terminalRewritePath,
} from "@/lib/terminal/flavour";

describe("terminalRewritePath", () => {
  it.each([
    ["/", "/terminal"],
    ["/tools", "/terminal"],
    ["/tools/", "/terminal"],
  ])("maps the home and tools index %s to /terminal", (path, expected) => {
    expect(terminalRewritePath(path)).toBe(expected);
  });

  it("maps a registered tool slug to its terminal route", () => {
    expect(terminalRewritePath("/tools/calculator")).toBe(
      "/terminal/tools/calculator",
    );
    expect(terminalRewritePath("/tools/units")).toBe("/terminal/tools/units");
  });

  it("maps a registered tool slug with a trailing slash", () => {
    expect(terminalRewritePath("/tools/calculator/")).toBe(
      "/terminal/tools/calculator",
    );
  });

  it("returns null for an unregistered or unknown slug", () => {
    expect(terminalRewritePath("/tools/hash")).toBeNull();
    expect(terminalRewritePath("/tools/nope")).toBeNull();
  });

  it("returns null for always-legacy routes and near misses", () => {
    expect(terminalRewritePath("/explore")).toBeNull();
    expect(terminalRewritePath("/privacy")).toBeNull();
    expect(terminalRewritePath("/tool")).toBeNull();
    expect(terminalRewritePath("/toolsfoo")).toBeNull();
  });

  it("agrees with isTerminalCapablePath on every path it accepts", () => {
    const paths = [
      "/",
      "/tools",
      "/tools/",
      "/tools/calculator",
      "/tools/calculator/",
      "/tools/units",
      "/tools/hash",
      "/tools/nope",
      "/explore",
      "/contribute",
      "/privacy",
      "/games",
      "/games/chess",
      "/tool",
      "/toolsfoo",
      "/tools/ Calculator",
    ];
    for (const path of paths) {
      expect(terminalRewritePath(path) !== null, path).toBe(
        isTerminalCapablePath(path),
      );
    }
  });
});

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
