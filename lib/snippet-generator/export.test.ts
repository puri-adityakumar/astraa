import { describe, it, expect } from "vitest";
import { buildExportFilename } from "./export";

describe("buildExportFilename", () => {
  it("strips common extensions", () => {
    expect(buildExportFilename("index.ts", 1715600000)).toBe("index-1715600000.png");
    expect(buildExportFilename("app.tsx", 1715600000)).toBe("app-1715600000.png");
    expect(buildExportFilename("style.css", 1715600000)).toBe("style-1715600000.png");
  });

  it("handles files without extension", () => {
    expect(buildExportFilename("readme", 42)).toBe("readme-42.png");
  });

  it("falls back to 'snippet' when filename is empty", () => {
    expect(buildExportFilename("", 99)).toBe("snippet-99.png");
    expect(buildExportFilename("   ", 99)).toBe("snippet-99.png");
  });

  it("sanitizes unsafe characters", () => {
    expect(buildExportFilename("foo/bar:baz?.ts", 1)).toBe("foo-bar-baz--1.png");
  });
});
