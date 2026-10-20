import { describe, expect, it } from "vitest";
import {
  FLAVOUR_COOKIE_MAX_AGE,
  FLAVOUR_COOKIE_NAME,
  FLAVOUR_LEGACY,
  FLAVOUR_TERMINAL,
  TERM_THEME_COOKIE_MAX_AGE,
  TERM_THEME_COOKIE_NAME,
  VISITED_COOKIE_MAX_AGE,
  VISITED_COOKIE_NAME,
  isTermTheme,
  parseFlavour,
  parseTermTheme,
  serializeFlavourCookie,
  serializeTermThemeCookie,
} from "@/lib/terminal/cookies";

describe("cookie constants", () => {
  it("uses the mission cookie names", () => {
    expect(FLAVOUR_COOKIE_NAME).toBe("astraa_flavour");
    expect(TERM_THEME_COOKIE_NAME).toBe("astraa_term_theme");
    expect(VISITED_COOKIE_NAME).toBe("astraa_visited");
  });

  it("uses the mission max-ages", () => {
    expect(FLAVOUR_COOKIE_MAX_AGE).toBe(31536000);
    expect(TERM_THEME_COOKIE_MAX_AGE).toBe(31536000);
    expect(VISITED_COOKIE_MAX_AGE).toBe(60 * 60 * 24);
  });
});

describe("parseFlavour", () => {
  it.each([undefined, null, ""])("defaults to terminal for %s", (value) => {
    expect(parseFlavour(value)).toBe(FLAVOUR_TERMINAL);
  });

  it("parses the terminal value", () => {
    expect(parseFlavour("terminal")).toBe(FLAVOUR_TERMINAL);
  });

  it("parses the legacy value", () => {
    expect(parseFlavour("legacy")).toBe(FLAVOUR_LEGACY);
  });

  it.each(["banana", "LEGACY", "Legacy", " terminal", "terminal ", "middleware"])(
    "treats garbage value %s as terminal",
    (value) => {
      expect(parseFlavour(value)).toBe(FLAVOUR_TERMINAL);
    },
  );
});

describe("parseTermTheme", () => {
  it.each([undefined, null, ""])("defaults to auto for %s", (value) => {
    expect(parseTermTheme(value)).toBe("auto");
  });

  it.each([
    "auto",
    "mocha",
    "dracula",
    "tokyo-night",
    "latte",
    "solarized-light",
    "rose-pine-dawn",
  ])("parses the valid theme %s", (theme) => {
    expect(parseTermTheme(theme)).toBe(theme);
  });

  it.each(["banana", "Mocha", "MOCHA", " mocha", "mocha ", "rose_pine_dawn"])(
    "treats garbage value %s as auto",
    (value) => {
      expect(parseTermTheme(value)).toBe("auto");
    },
  );
});

describe("isTermTheme", () => {
  it("accepts every valid theme value", () => {
    for (const theme of [
      "auto",
      "mocha",
      "dracula",
      "tokyo-night",
      "latte",
      "solarized-light",
      "rose-pine-dawn",
    ]) {
      expect(isTermTheme(theme)).toBe(true);
    }
  });

  it("rejects garbage, non-strings and casing drift", () => {
    expect(isTermTheme("banana")).toBe(false);
    expect(isTermTheme("Mocha")).toBe(false);
    expect(isTermTheme(42)).toBe(false);
    expect(isTermTheme(undefined)).toBe(false);
    expect(isTermTheme("")).toBe(false);
  });
});

describe("serializeFlavourCookie", () => {
  it("serializes legacy with path, max-age and samesite, not httpOnly", () => {
    expect(serializeFlavourCookie("legacy")).toBe(
      "astraa_flavour=legacy; path=/; max-age=31536000; samesite=lax",
    );
  });

  it("serializes terminal", () => {
    expect(serializeFlavourCookie("terminal")).toBe(
      "astraa_flavour=terminal; path=/; max-age=31536000; samesite=lax",
    );
  });
});

describe("serializeTermThemeCookie", () => {
  it("serializes a theme with path, max-age and samesite, not httpOnly", () => {
    expect(serializeTermThemeCookie("dracula")).toBe(
      "astraa_term_theme=dracula; path=/; max-age=31536000; samesite=lax",
    );
  });
});
