import { describe, it, expect } from "vitest";
import { formatBytes } from "./format";

describe("formatBytes", () => {
  it("formats zero as Bytes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats 1024 as 1 KB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats 1048576 as 1 MB", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats 1073741824 as 1 GB", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("returns 0 Bytes for negative numbers", () => {
    expect(formatBytes(-100)).toBe("0 Bytes");
  });

  it("returns 0 Bytes for NaN", () => {
    expect(formatBytes(NaN)).toBe("0 Bytes");
  });

  it("returns 0 Bytes for Infinity", () => {
    expect(formatBytes(Infinity)).toBe("0 Bytes");
  });

  it("respects the decimals argument", () => {
    expect(formatBytes(1536, 2)).toBe("1.5 KB");
  });

  it("clamps beyond TB", () => {
    // 1024^5 PB would index out of range without clamping
    const huge = Math.pow(1024, 5);
    expect(formatBytes(huge)).toBe(`${parseFloat((huge / Math.pow(1024, 4)).toFixed(1))} TB`);
  });
});
