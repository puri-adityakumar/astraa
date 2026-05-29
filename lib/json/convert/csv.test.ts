import { describe, it, expect } from "vitest";
import { jsonToCsv, csvToJson, isCsvCompatible } from "./csv";

describe("isCsvCompatible", () => {
  it("returns true for array of flat objects", () => {
    expect(isCsvCompatible([{ a: 1 }, { a: 2 }])).toBe(true);
  });

  it("returns false for nested object inside array", () => {
    expect(isCsvCompatible([{ a: { b: 1 } }])).toBe(false);
  });

  it("returns false for non-array", () => {
    expect(isCsvCompatible({ a: 1 })).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(isCsvCompatible([])).toBe(false);
  });
});

describe("jsonToCsv", () => {
  it("converts array of objects to CSV", async () => {
    const out = await jsonToCsv([{ a: 1, b: "x" }, { a: 2, b: "y" }]);
    expect(out).toContain("a,b");
    expect(out).toContain("1,x");
    expect(out).toContain("2,y");
  });
});

describe("csvToJson", () => {
  it("parses CSV into array of objects", async () => {
    const result = await csvToJson("a,b\n1,x\n2,y");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([{ a: "1", b: "x" }, { a: "2", b: "y" }]);
    }
  });
});
