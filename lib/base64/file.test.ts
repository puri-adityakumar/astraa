import { describe, expect, it } from "vitest";
import { sniffImageMime } from "./file";

describe("sniffImageMime", () => {
  it("identifies PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)", () => {
    const bytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    expect(sniffImageMime(bytes)).toBe("image/png");
  });

  it("identifies JPEG magic bytes (FF D8 FF)", () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00]);
    expect(sniffImageMime(bytes)).toBe("image/jpeg");
  });

  it("identifies GIF87a magic bytes (47 49 46 38 37 61)", () => {
    const bytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x37, 0x61,
    ]);
    expect(sniffImageMime(bytes)).toBe("image/gif");
  });

  it("identifies GIF89a magic bytes (47 49 46 38 39 61)", () => {
    const bytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
    ]);
    expect(sniffImageMime(bytes)).toBe("image/gif");
  });

  it("identifies WebP magic bytes (RIFF????WEBP)", () => {
    const bytes = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(sniffImageMime(bytes)).toBe("image/webp");
  });

  it("returns null for arbitrary bytes", () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(sniffImageMime(bytes)).toBeNull();
  });

  it("returns null for an empty buffer", () => {
    expect(sniffImageMime(new Uint8Array([]))).toBeNull();
  });

  it("returns null for input shorter than the shortest magic", () => {
    expect(sniffImageMime(new Uint8Array([0xff]))).toBeNull();
  });
});
