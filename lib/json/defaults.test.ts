import { describe, expect, it } from "vitest";

import {
  ALLOWED_MIME,
  DEFAULT_STATE,
  INDENT_OPTIONS,
  MAX_DOCUMENT_BYTES,
  MAX_PERSIST_BYTES,
  MAX_REPAIR_BYTES,
  SAMPLE_JSON,
} from "./defaults";

describe("defaults", () => {
  it("SAMPLE_JSON parses to a valid object", () => {
    const parsed = JSON.parse(SAMPLE_JSON) as unknown;
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

describe("JSON starter document", () => {
  it("uses clearly fictional data while exercising common JSON value types", () => {
    const sample = JSON.parse(SAMPLE_JSON) as unknown;

    expect(sample).toMatchObject({
      title: "Fictional garden checklist",
      revision: 3,
      published: false,
      labels: ["sample", "planning"],
      summary: null,
      settings: {
        theme: "moonlight",
        showCompleted: true,
      },
      items: [
        { id: 1, task: "Sketch a winding path", done: true },
        { id: 2, task: "Choose imaginary flowers", done: false },
      ],
    });
  });

  it("contains no product metrics, pricing signals, or Astraa product names", () => {
    expect(SAMPLE_JSON).not.toMatch(
      /users|rating|premium|released|Code Snippet Generator|Markdown Editor|JSON Editor/i,
    );
  });
});
