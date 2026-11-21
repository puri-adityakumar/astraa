import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { generatePassword, generateMemorablePassword, generatePin } from "./password-utils";

describe("generatePassword", () => {
  it("generates password of correct length", () => {
    const result = generatePassword(16, {
      uppercase: true, lowercase: true, numbers: true, symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toHaveLength(16);
  });
  it("includes uppercase when enabled", () => {
    const result = generatePassword(50, {
      uppercase: true, lowercase: false, numbers: false, symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[A-Z]+$/);
  });
  it("includes lowercase when enabled", () => {
    const result = generatePassword(50, {
      uppercase: false, lowercase: true, numbers: false, symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[a-z]+$/);
  });
  it("includes numbers when enabled", () => {
    const result = generatePassword(50, {
      uppercase: false, lowercase: false, numbers: true, symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[0-9]+$/);
  });
  it("fails when no character types selected", () => {
    const result = generatePassword(16, {
      uppercase: false, lowercase: false, numbers: false, symbols: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("at least one");
  });
  it("fails when length too short for selected types", () => {
    const result = generatePassword(2, {
      uppercase: true, lowercase: true, numbers: true, symbols: true,
    });
    expect(result.success).toBe(false);
  });
  it("generates different passwords each time", () => {
    const opts = { uppercase: true, lowercase: true, numbers: true, symbols: true };
    const r1 = generatePassword(32, opts);
    const r2 = generatePassword(32, opts);
    expect(r1.success && r2.success).toBe(true);
    if (r1.success && r2.success) expect(r1.password).not.toBe(r2.password);
  });
});

describe("generatePin", () => {
  it("generates pin of correct length", () => {
    const result = generatePin(6);
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toHaveLength(6);
  });
  it("generates only digits", () => {
    const result = generatePin(10);
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[0-9]+$/);
  });
});

describe("generateMemorablePassword", () => {
  // niceware v4 only accepts a Uint8Array when a browser `window` exists; the
  // generator runs in the client, so mirror that environment here.
  beforeAll(() => vi.stubGlobal("window", { Uint8Array }));
  afterAll(() => vi.unstubAllGlobals());

  it("joins one word per requested count with hyphens", async () => {
    const result = await generateMemorablePassword(5, false);
    expect(result.success).toBe(true);
    if (result.success) expect(result.password.split("-")).toHaveLength(5);
  });
  it("capitalizes every word when requested", async () => {
    const result = await generateMemorablePassword(4, true);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.password.split("-").every((word) => /^[A-Z]/.test(word))).toBe(true);
    }
  });
  it("leaves words lowercase when capitalization is off", async () => {
    const result = await generateMemorablePassword(4, false);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.password.split("-").every((word) => word === word.toLowerCase())).toBe(true);
    }
  });
  it("clamps the word count to the supported 2-10 range", async () => {
    const low = await generateMemorablePassword(1, false);
    expect(low.success).toBe(true);
    if (low.success) expect(low.password.split("-")).toHaveLength(2);

    const high = await generateMemorablePassword(99, false);
    expect(high.success).toBe(true);
    if (high.success) expect(high.password.split("-")).toHaveLength(10);
  });
  it("produces a different passphrase each call", async () => {
    const first = await generateMemorablePassword(6, false);
    const second = await generateMemorablePassword(6, false);
    expect(first.success && second.success).toBe(true);
    if (first.success && second.success) expect(first.password).not.toBe(second.password);
  });
});
