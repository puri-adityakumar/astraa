import { describe, it, expect } from "vitest";
import { applyReplace } from "./replace";

describe("applyReplace", () => {
  it("supports $1 backreference", () => {
    const result = applyReplace(/(\w+)\s(\w+)/, "John Smith", "$2 $1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("Smith John");
    }
  });

  it("supports named group references", () => {
    const namedRegex = new RegExp("(?<first>\\w+)\\s(?<last>\\w+)");
    const result = applyReplace(namedRegex, "John Smith", "$<last> $<first>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("Smith John");
    }
  });

  it("leaves missing $9 literal when group not captured", () => {
    const result = applyReplace(/(\d+)/, "abc 123 def", "X$9Y");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("abc X$9Y def");
    }
  });

  it("replaces all matches when global flag set", () => {
    const result = applyReplace(/a/g, "banana", "o");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("bonono");
    }
  });

  it("replaces only first match when no global flag", () => {
    const result = applyReplace(/a/, "banana", "o");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result).toBe("bonana");
    }
  });
});
