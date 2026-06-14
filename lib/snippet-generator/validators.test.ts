import { describe, it, expect } from "vitest";
import {
  validateImageFile,
  validateCodeLength,
  MAX_IMAGE_BYTES,
  MAX_CODE_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "./validators";

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("validateImageFile", () => {
  it("accepts a 1KB PNG", () => {
    const f = makeFile("a.png", "image/png", 1024);
    expect(validateImageFile(f).ok).toBe(true);
  });

  it("accepts JPEG and WebP", () => {
    expect(validateImageFile(makeFile("a.jpg", "image/jpeg", 1024)).ok).toBe(true);
    expect(validateImageFile(makeFile("a.webp", "image/webp", 1024)).ok).toBe(true);
  });

  it("rejects GIF", () => {
    const result = validateImageFile(makeFile("a.gif", "image/gif", 1024));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("type");
  });

  it("rejects files larger than MAX_IMAGE_BYTES", () => {
    const f = makeFile("big.png", "image/png", MAX_IMAGE_BYTES + 1);
    const result = validateImageFile(f);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("size");
  });

  it("MAX_IMAGE_BYTES is 5 MB", () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
  });

  it("ALLOWED_IMAGE_TYPES contains png, jpeg, webp", () => {
    expect(ALLOWED_IMAGE_TYPES).toEqual(["image/png", "image/jpeg", "image/webp"]);
  });
});

describe("validateCodeLength", () => {
  it("accepts code under limit", () => {
    expect(validateCodeLength("hello").ok).toBe(true);
  });

  it("rejects code over MAX_CODE_BYTES", () => {
    const big = "a".repeat(MAX_CODE_BYTES + 1);
    const result = validateCodeLength(big);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("size");
  });

  it("MAX_CODE_BYTES is 100 KB", () => {
    expect(MAX_CODE_BYTES).toBe(100 * 1024);
  });
});
