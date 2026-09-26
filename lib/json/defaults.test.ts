import { describe, it, expect } from "vitest";
import {
  SAMPLE_JSON,
  MAX_DOCUMENT_BYTES,
  MAX_PERSIST_BYTES,
  MAX_REPAIR_BYTES,
  INDENT_OPTIONS,
  ALLOWED_MIME,
  DEFAULT_STATE,
} from "./defaults";

describe("defaults", () => {
  it("SAMPLE_JSON parses to a valid object", () => {
    const parsed = JSON.parse(SAMPLE_JSON);
    expect(typeof parsed).toBe("object");
    expect(parsed).not.toBeNull();
  });

  it("MAX_DOCUMENT_BYTES is 50 MB", () => {
    expect(MAX_DOCUMENT_BYTES).toBe(50 * 1024 * 1024);
  });

  it("MAX_PERSIST_BYTES is 256 KB", () => {
    expect(MAX_PERSIST_BYTES).toBe(256 * 1024);
  });

  it("MAX_REPAIR_BYTES is 5 MB", () => {
    expect(MAX_REPAIR_BYTES).toBe(5 * 1024 * 1024);
  });

  it("INDENT_OPTIONS contains 2, 4, tab", () => {
    expect(INDENT_OPTIONS).toEqual([2, 4, "tab"]);
  });

  it("ALLOWED_MIME contains application/json and text/plain", () => {
    expect(ALLOWED_MIME).toContain("application/json");
    expect(ALLOWED_MIME).toContain("text/plain");
  });

  it("DEFAULT_STATE.view is text", () => {
    expect(DEFAULT_STATE.view).toBe("text");
  });

  it("DEFAULT_STATE.indent is 2", () => {
    expect(DEFAULT_STATE.indent).toBe(2);
  });

  it("DEFAULT_STATE.text equals SAMPLE_JSON", () => {
    expect(DEFAULT_STATE.text).toBe(SAMPLE_JSON);
  });
});
