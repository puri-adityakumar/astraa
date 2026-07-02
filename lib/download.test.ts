import { describe, it, expect } from "vitest";
import * as downloadModule from "./download";

/**
 * Testing strategy (option (a) from the task):
 *
 * vitest runs in a node environment (no jsdom / `document` / `URL.createObjectURL`),
 * so `downloadBlob` and `downloadContent` — which perform the DOM "anchor dance" —
 * cannot be exercised here without heavy, brittle DOM mocking. We keep
 * `download.ts` thin and avoid over-testing DOM mechanics. Instead we cover the
 * pure, DOM-free surface:
 *   - the module exports all three functions,
 *   - `buildBlob` (the only non-trivial pure logic) constructs a correctly-typed
 *     Blob from string and binary input.
 *
 * `downloadContent` is a one-line composition (`downloadBlob(buildBlob(...))`)
 * and `downloadBlob` is pure DOM wiring, so neither warrants brittle DOM stubs.
 * The buildBlob behavior is what `downloadContent` depends on, and it is covered.
 */

describe("download module exports", () => {
  it("exports buildBlob, downloadBlob and downloadContent", () => {
    expect(typeof downloadModule.buildBlob).toBe("function");
    expect(typeof downloadModule.downloadBlob).toBe("function");
    expect(typeof downloadModule.downloadContent).toBe("function");
  });
});

describe("buildBlob", () => {
  it("builds a Blob from a string with the given mime", () => {
    const blob = downloadModule.buildBlob("hello", "text/plain");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("text/plain");
  });

  it("builds a Blob from a Uint8Array", () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const blob = downloadModule.buildBlob(bytes, "application/octet-stream");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("application/octet-stream");
    expect(blob.size).toBe(3);
  });
});
