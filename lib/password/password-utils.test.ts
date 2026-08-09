import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateMemorablePassword, generatePassword, generatePin } from "./password-utils";

describe("generatePassword", () => {
  it("generates password of correct length", () => {
    const result = generatePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toHaveLength(16);
  });
  it("includes uppercase when enabled", () => {
    const result = generatePassword(50, {
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[A-Z]+$/);
  });
  it("includes lowercase when enabled", () => {
    const result = generatePassword(50, {
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[a-z]+$/);
  });
  it("includes numbers when enabled", () => {
    const result = generatePassword(50, {
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.password).toMatch(/^[0-9]+$/);
  });
  it("fails when no character types selected", () => {
    const result = generatePassword(16, {
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toContain("at least one");
  });
  it("fails when length too short for selected types", () => {
    const result = generatePassword(2, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
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

  it("guarantees every selected character class", () => {
    const result = generatePassword(32, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.password).toMatch(/[A-Z]/);
      expect(result.password).toMatch(/[a-z]/);
      expect(result.password).toMatch(/[0-9]/);
      expect(result.password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/);
    }
  });
});

describe("generateMemorablePassword", () => {
  beforeEach(() => {
    // niceware accepts Uint8Array only when its browser guard is present.
    vi.stubGlobal("window", { Uint8Array });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clamps the word count to the supported range", () => {
    const minimum = generateMemorablePassword(1, false);
    const maximum = generateMemorablePassword(20, false);

    expect(minimum.success).toBe(true);
    expect(maximum.success).toBe(true);
    if (minimum.success) expect(minimum.password.split("-")).toHaveLength(2);
    if (maximum.success) expect(maximum.password.split("-")).toHaveLength(10);
  });

  it("capitalizes every word when requested", () => {
    const result = generateMemorablePassword(4, true);

    expect(result.success).toBe(true);
    if (result.success) {
      for (const word of result.password.split("-")) {
        expect(word[0]).toMatch(/[A-Z]/);
      }
    }
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
