import { describe, expect, it } from "vitest";
import { validateBase64 } from "./validate";

describe("validateBase64", () => {
  it("accepts a properly padded standard base64 string", () => {
    expect(validateBase64("aGVsbG8=", { urlSafe: false })).toEqual({ ok: true });
  });

  it("rejects an empty string", () => {
    expect(validateBase64("", { urlSafe: false })).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("rejects whitespace-only input as empty", () => {
    expect(validateBase64("   \n\t", { urlSafe: false })).toEqual({
      ok: false,
      reason: "empty",
    });
  });

  it("rejects strings with non-base64 characters", () => {
    expect(validateBase64("!@#$", { urlSafe: false })).toEqual({
      ok: false,
      reason: "non-base64 chars",
    });
  });

  it("accepts when length is a multiple of 4 with no padding needed", () => {
    expect(validateBase64("YWJj", { urlSafe: false })).toEqual({ ok: true });
  });

  it("rejects bad padding", () => {
    expect(validateBase64("YWJ", { urlSafe: false })).toEqual({
      ok: false,
      reason: "bad padding",
    });
  });

  it("strips ASCII whitespace before validating", () => {
    expect(validateBase64("aGVs\nbG8=", { urlSafe: false })).toEqual({
      ok: true,
    });
  });

  it("accepts url-safe alphabet when urlSafe is true", () => {
    expect(validateBase64("aGVs-bG8_", { urlSafe: true })).toEqual({ ok: true });
  });

  it("rejects url-safe alphabet when urlSafe is false", () => {
    expect(validateBase64("aGVs-bG8", { urlSafe: false })).toEqual({
      ok: false,
      reason: "non-base64 chars",
    });
  });

  it("accepts url-safe without padding", () => {
    expect(validateBase64("aGVsbG8", { urlSafe: true })).toEqual({ ok: true });
  });
});
