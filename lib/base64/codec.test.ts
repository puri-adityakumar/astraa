import { describe, expect, it } from "vitest";
import {
  encodeText,
  encodeBytes,
  decodeToText,
  decodeToBytes,
} from "./codec";

describe("encodeText", () => {
  it("encodes ASCII to standard base64 with padding", () => {
    expect(encodeText("hello", { urlSafe: false, wrap76: false })).toBe(
      "aGVsbG8=",
    );
  });

  it("strips padding when urlSafe is true", () => {
    expect(encodeText("hello", { urlSafe: true, wrap76: false })).toBe(
      "aGVsbG8",
    );
  });

  it("uses url-safe alphabet (no + or /) when urlSafe is true", () => {
    const input = "??>>"; // produces + and / in std alphabet
    const std = encodeText(input, { urlSafe: false, wrap76: false });
    const safe = encodeText(input, { urlSafe: true, wrap76: false });
    expect(std).toMatch(/[+/]/);
    expect(safe).not.toMatch(/[+/=]/);
  });

  it("encodes non-ASCII via UTF-8", () => {
    expect(encodeText("héllo", { urlSafe: false, wrap76: false })).toBe(
      "aMOpbGxv",
    );
  });

  it("inserts a newline every 76 chars when wrap76 is true", () => {
    const out = encodeText("a".repeat(100), {
      urlSafe: false,
      wrap76: true,
    });
    const noNewlines = out.replace(/\n/g, "");
    expect(out).toContain("\n");
    expect(out.split("\n")[0]).toHaveLength(76);
    // round-trip works once newlines stripped
    expect(decodeToText(noNewlines, { urlSafe: false, wrap76: false })).toBe(
      "a".repeat(100),
    );
  });
});

describe("encodeBytes", () => {
  it("encodes raw bytes without text decoding", () => {
    expect(
      encodeBytes(new Uint8Array([1, 2, 3]), {
        urlSafe: false,
        wrap76: false,
      }),
    ).toBe("AQID");
  });
});

describe("decodeToText", () => {
  it("decodes standard base64", () => {
    expect(decodeToText("aGVsbG8=", { urlSafe: false, wrap76: false })).toBe(
      "hello",
    );
  });

  it("decodes url-safe base64 without padding", () => {
    expect(decodeToText("aGVsbG8", { urlSafe: true, wrap76: false })).toBe(
      "hello",
    );
  });

  it("transparently accepts url-safe alphabet even when urlSafe flag is false", () => {
    const stdEncoded = encodeText("??>>", { urlSafe: false, wrap76: false });
    const safeEncoded = stdEncoded
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    expect(decodeToText(safeEncoded, { urlSafe: false, wrap76: false })).toBe(
      "??>>",
    );
  });

  it("strips ASCII whitespace before decoding", () => {
    expect(decodeToText("aGVs\nbG8=", { urlSafe: false, wrap76: false })).toBe(
      "hello",
    );
  });
});

describe("decodeToBytes", () => {
  it("decodes to a Uint8Array", () => {
    expect(decodeToBytes("AQID", { urlSafe: false, wrap76: false })).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });
});
