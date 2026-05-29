import { describe, it, expect } from "vitest";
import { compileRegex } from "./compile";

describe("compileRegex", () => {
  it("compiles a valid pattern", () => {
    const result = compileRegex("abc", "");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.regex).toBeInstanceOf(RegExp);
      expect(result.regex.source).toBe("abc");
    }
  });

  it("returns error for invalid pattern", () => {
    const result = compileRegex("(", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
    }
  });

  it("accepts all flags gimsuy", () => {
    const result = compileRegex("a", "gimsuy");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.regex.flags).toBe("gimsuy");
    }
  });

  it("rejects duplicate flags", () => {
    const result = compileRegex("a", "gg");
    expect(result.ok).toBe(false);
  });

  it("returns Empty pattern error for empty string", () => {
    const result = compileRegex("", "g");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Empty pattern");
    }
  });
});
