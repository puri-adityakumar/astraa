import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "./url-state";

describe("encodeState / decodeState", () => {
  it("roundtrips a simple state", () => {
    const state = {
      pattern: "\\d+",
      flags: "gi",
      test: "abc 123 def 456",
      replacement: "[$&]",
    };
    const { hash, truncated } = encodeState(state);
    expect(truncated).toBe(false);
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
    const decoded = decodeState(hash);
    expect(decoded).toEqual(state);
  });

  it("roundtrips unicode content", () => {
    const state = {
      pattern: "\\p{L}+",
      flags: "gu",
      test: "héllo wörld 你好 🚀",
      replacement: "★",
    };
    const { hash } = encodeState(state);
    const decoded = decodeState(hash);
    expect(decoded).toEqual(state);
  });

  it("roundtrips empty fields", () => {
    const state = { pattern: "", flags: "", test: "", replacement: "" };
    const { hash, truncated } = encodeState(state);
    expect(truncated).toBe(false);
    const decoded = decodeState(hash);
    expect(decoded).toEqual(state);
  });

  it("strips a leading '#' on decode", () => {
    const state = {
      pattern: "a",
      flags: "g",
      test: "aaa",
      replacement: "b",
    };
    const { hash } = encodeState(state);
    const decoded = decodeState("#" + hash);
    expect(decoded).toEqual(state);
  });

  it("produces base64url output without +, /, or = padding", () => {
    const state = {
      pattern: "\\W+",
      flags: "g",
      test: "padding likely!! >>> ??? <<<",
      replacement: "_",
    };
    const { hash } = encodeState(state);
    expect(hash).not.toMatch(/[+/=]/);
  });

  it("truncates test strings larger than 8 KB and flags truncated", () => {
    const bigTest = "x".repeat(8 * 1024 + 500);
    const state = {
      pattern: "x+",
      flags: "g",
      test: bigTest,
      replacement: "",
    };
    const { hash, truncated } = encodeState(state);
    expect(truncated).toBe(true);
    const decoded = decodeState(hash);
    expect(decoded).not.toBeNull();
    if (decoded) {
      expect(decoded.pattern).toBe("x+");
      expect(decoded.flags).toBe("g");
      expect(decoded.replacement).toBe("");
      // The encoded test must be <= 8 KB after truncation
      expect(decoded.test.length).toBeLessThanOrEqual(8 * 1024);
      // The truncated content should still match the prefix
      expect(bigTest.startsWith(decoded.test)).toBe(true);
    }
  });

  it("does not truncate test strings at exactly 8 KB", () => {
    const exactTest = "y".repeat(8 * 1024);
    const state = {
      pattern: "y",
      flags: "g",
      test: exactTest,
      replacement: "",
    };
    const { truncated, hash } = encodeState(state);
    expect(truncated).toBe(false);
    const decoded = decodeState(hash);
    expect(decoded?.test.length).toBe(8 * 1024);
  });

  it("returns null for an empty hash", () => {
    expect(decodeState("")).toBeNull();
    expect(decodeState("#")).toBeNull();
  });

  it("returns null for a corrupt hash", () => {
    expect(decodeState("not-base64!!!@@@")).toBeNull();
    expect(decodeState("####")).toBeNull();
  });

  it("returns null when JSON shape is wrong", () => {
    // base64url-encoded JSON missing the expected keys
    const bogusJson = JSON.stringify({ x: 1, y: 2 });
    const bytes = new TextEncoder().encode(bogusJson);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    const b64 = btoa(bin)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    expect(decodeState(b64)).toBeNull();
  });
});
