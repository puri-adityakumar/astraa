import { describe, expect, it } from "vitest";
import { cycleTermTheme, parseConfigArgs } from "./config";
import { TERM_THEMES } from "./cookies";

describe("parseConfigArgs", () => {
  it.each(["", " ", "\t\n"])("opens settings for empty input %j", (args) => {
    expect(parseConfigArgs(args)).toEqual({ kind: "open" });
  });

  it.each([
    ["theme mocha", "mocha"],
    ["  ThEmE \t DRACULA \n", "dracula"],
    ["theme", ""],
    ["theme \t", ""],
    ["theme not-a-theme", "not-a-theme"],
    ["theme mocha latte", "mocha latte"],
  ])("parses theme input %j without silently dropping arguments", (args, name) => {
    expect(parseConfigArgs(args)).toEqual({ kind: "theme", name });
  });

  it.each(["legacy", " LEGACY ", "interface legacy", " \tInTeRfAcE \n Legacy "])(
    "recognizes the legacy shortcut %j",
    (args) => {
      expect(parseConfigArgs(args)).toEqual({ kind: "legacy" });
    },
  );

  it.each([
    "unknown",
    "interface",
    "interface terminal",
    "interface unknown",
    "interface legacy extra",
    "legacy extra",
    "themes mocha",
  ])("rejects unsupported or extra arguments %j", (args) => {
    expect(parseConfigArgs(args)).toEqual({ kind: "invalid" });
  });
});

describe("cycleTermTheme", () => {
  it("advances and reverses through every theme in the declared order", () => {
    TERM_THEMES.forEach((theme, index) => {
      const next = (index + 1) % TERM_THEMES.length;
      const previous = (index - 1 + TERM_THEMES.length) % TERM_THEMES.length;
      expect(cycleTermTheme(theme, 1)).toBe(TERM_THEMES[next]);
      expect(cycleTermTheme(theme, -1)).toBe(TERM_THEMES[previous]);
    });
  });

  it("wraps at both ends, including auto", () => {
    expect(cycleTermTheme("auto", -1)).toBe("rose-pine-dawn");
    expect(cycleTermTheme("rose-pine-dawn", 1)).toBe("auto");
  });

  it("accepts whitespace and case-insensitive current values", () => {
    expect(cycleTermTheme("  DRACULA \t", 1)).toBe("tokyo-night");
    expect(cycleTermTheme(" LaTtE ", -1)).toBe("tokyo-night");
  });

  it.each(["", "unknown", " ", "mocha extra"])("resets unknown values %j to auto", (value) => {
    expect(cycleTermTheme(value, 1)).toBe("auto");
    expect(cycleTermTheme(value, -1)).toBe("auto");
  });
});
