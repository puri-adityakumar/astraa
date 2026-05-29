import { describe, it, expect } from "vitest";
import { isSupportedLanguage, isSupportedTheme, getDefaultLanguage } from "./highlight";

describe("highlight helpers", () => {
  it("recognizes supported languages", () => {
    expect(isSupportedLanguage("typescript")).toBe(true);
    expect(isSupportedLanguage("python")).toBe(true);
  });

  it("rejects unsupported languages", () => {
    expect(isSupportedLanguage("brainfuck")).toBe(false);
  });

  it("recognizes supported themes", () => {
    expect(isSupportedTheme("github-dark")).toBe(true);
    expect(isSupportedTheme("dracula")).toBe(true);
  });

  it("rejects unsupported themes", () => {
    expect(isSupportedTheme("hot-pink")).toBe(false);
  });

  it("default language is typescript", () => {
    expect(getDefaultLanguage()).toBe("typescript");
  });
});

import { highlight } from "./highlight";

describe("highlight()", () => {
  it("returns non-empty lines for valid input", async () => {
    const result = await highlight("const x = 1;", "typescript", "github-dark");
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.lines[0]?.length).toBeGreaterThan(0);
    expect(result.bg).toBeTruthy();
    expect(result.fg).toBeTruthy();
  });

  it("falls back to defaults for unsupported language and theme", async () => {
    const result = await highlight("hello", "brainfuck", "hot-pink");
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.bg).toBeTruthy();
    expect(result.fg).toBeTruthy();
  });

  it("loads additional languages on demand", async () => {
    const result = await highlight("def foo():\n  pass\n", "python", "github-dark");
    expect(result.lines.length).toBeGreaterThanOrEqual(2);
  });

  it("loads additional themes on demand", async () => {
    const result = await highlight("const y = 2;", "typescript", "dracula");
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.bg).toBeTruthy();
  });
});
