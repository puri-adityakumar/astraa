import { describe, expect, it } from "vitest";
import { TERMINAL_TOOL_SLUGS, isTerminalToolSlug } from "@/lib/terminal/slugs";

describe("terminal tool slugs", () => {
  it("registers the milestone slugs in order", () => {
    expect([...TERMINAL_TOOL_SLUGS]).toEqual([
      "calculator",
      "units",
      "base64",
      "hash",
      "regex",
      "json",
      "password",
      "currency",
      "text",
      "image",
      "markdown",
      "snippet-generator",
      "music",
      "sql",
    ]);
  });

  it("accepts a slug in the list", () => {
    expect(isTerminalToolSlug("calculator")).toBe(true);
    expect(isTerminalToolSlug("units")).toBe(true);
    expect(isTerminalToolSlug("base64")).toBe(true);
    expect(isTerminalToolSlug("hash")).toBe(true);
    expect(isTerminalToolSlug("regex")).toBe(true);
    expect(isTerminalToolSlug("json")).toBe(true);
    expect(isTerminalToolSlug("password")).toBe(true);
    expect(isTerminalToolSlug("currency")).toBe(true);
    expect(isTerminalToolSlug("text")).toBe(true);
    expect(isTerminalToolSlug("image")).toBe(true);
    expect(isTerminalToolSlug("markdown")).toBe(true);
    expect(isTerminalToolSlug("snippet-generator")).toBe(true);
    expect(isTerminalToolSlug("music")).toBe(true);
    expect(isTerminalToolSlug("sql")).toBe(true);
  });

  it("rejects unknown, empty and casing-drifted slugs", () => {
    expect(isTerminalToolSlug("nope")).toBe(false);
    expect(isTerminalToolSlug("")).toBe(false);
    expect(isTerminalToolSlug("Calculator")).toBe(false);
    expect(isTerminalToolSlug("calculator/")).toBe(false);
  });
});
