import { describe, expect, it } from "vitest";
import { generateExample } from "./example-gen";

describe("generateExample", () => {
  it("repeats \\d for a fixed count", () => {
    expect(generateExample("\\d{3}")).toBe("555");
  });

  it("generates a non-empty string for character class with quantifier", () => {
    const out = generateExample("[a-z]+");
    expect(out).toBeTruthy();
    expect(out?.length ?? 0).toBeGreaterThan(0);
  });

  it("picks first branch of alternation", () => {
    expect(generateExample("(foo|bar)")).toBe("foo");
  });

  it("ignores anchors", () => {
    expect(generateExample("^abc$")).toBe("abc");
  });

  it("returns null for lookbehind", () => {
    expect(generateExample("(?<=foo)bar")).toBeNull();
  });

  it("returns null for backreference", () => {
    expect(generateExample("(\\w+)\\1")).toBeNull();
  });

  it("returns null for empty pattern", () => {
    expect(generateExample("")).toBeNull();
  });

  it("returns null for repeat count above MAX_REPEAT", () => {
    expect(generateExample("a{100}")).toBeNull();
  });

  it("caps output length at 32 characters", () => {
    const out = generateExample("\\d{5}\\w{5}\\d{5}\\w{5}\\d{5}\\w{5}\\d{5}");
    expect(out?.length ?? 0).toBeLessThanOrEqual(32);
  });
});
