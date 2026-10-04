import { describe, expect, it } from "vitest";
import { TERMINAL_TOOL_SLUGS, isTerminalToolSlug } from "@/lib/terminal/slugs";

describe("terminal tool slugs", () => {
  it("registers only calculator at this milestone", () => {
    expect([...TERMINAL_TOOL_SLUGS]).toEqual(["calculator"]);
  });

  it("accepts a slug in the list", () => {
    expect(isTerminalToolSlug("calculator")).toBe(true);
  });

  it("rejects slugs that are not terminal yet", () => {
    expect(isTerminalToolSlug("hash")).toBe(false);
    expect(isTerminalToolSlug("units")).toBe(false);
  });

  it("rejects unknown, empty and casing-drifted slugs", () => {
    expect(isTerminalToolSlug("nope")).toBe(false);
    expect(isTerminalToolSlug("")).toBe(false);
    expect(isTerminalToolSlug("Calculator")).toBe(false);
    expect(isTerminalToolSlug("calculator/")).toBe(false);
  });
});
