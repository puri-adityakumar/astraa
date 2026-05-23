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
