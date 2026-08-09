import { describe, expect, it } from "vitest";

import { formatConvertedAmount, parseConversionAmount } from "./conversion";

describe("rate conversion", () => {
  it("parses zero and positive finite amounts", () => {
    expect(parseConversionAmount("0")).toBe(0);
    expect(parseConversionAmount(" 12.5 ")).toBe(12.5);
  });

  it("rejects empty, negative, and non-finite amounts", () => {
    expect(parseConversionAmount("")).toBeNull();
    expect(parseConversionAmount("-1")).toBeNull();
    expect(parseConversionAmount("Infinity")).toBeNull();
    expect(parseConversionAmount("abc")).toBeNull();
  });

  it("derives a formatted result without remote state", () => {
    expect(formatConvertedAmount("10", 0.9234, 2)).toBe("9.23");
    expect(formatConvertedAmount("0.5", 67_500, 6)).toBe("33750.000000");
    expect(formatConvertedAmount("10", null, 2)).toBe("");
  });
});
