import { describe, it, expect } from "vitest";
import { validateFile, MAX_DOCUMENT_BYTES, ALLOWED_MIME } from "./validators";

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("validateFile", () => {
  it("accepts a small .json file", () => {
    expect(validateFile(makeFile("data.json", "application/json", 1024)).ok).toBe(true);
  });

  it("accepts text/plain", () => {
    expect(validateFile(makeFile("data.txt", "text/plain", 1024)).ok).toBe(true);
  });

  it("accepts unknown MIME with .json extension", () => {
    expect(validateFile(makeFile("data.json", "", 1024)).ok).toBe(true);
  });

  it("rejects image/png", () => {
    const r = validateFile(makeFile("a.png", "image/png", 1024));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("type");
  });

  it("rejects files over MAX_DOCUMENT_BYTES", () => {
    const r = validateFile(makeFile("big.json", "application/json", MAX_DOCUMENT_BYTES + 1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("size");
  });

  it("ALLOWED_MIME exposed", () => {
    expect(ALLOWED_MIME).toContain("application/json");
  });
});
