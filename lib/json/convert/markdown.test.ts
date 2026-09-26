import { describe, it, expect } from "vitest";
import { jsonToMarkdown } from "./markdown";

describe("jsonToMarkdown", () => {
  it("converts array of flat objects to markdown table", () => {
    const md = jsonToMarkdown([{ name: "a", n: 1 }, { name: "b", n: 2 }]);
    expect(md).toContain("| name | n |");
    expect(md).toContain("| --- | --- |");
    expect(md).toContain("| a | 1 |");
    expect(md).toContain("| b | 2 |");
  });

  it("throws on non-compatible input", () => {
    expect(() => jsonToMarkdown({ a: 1 })).toThrow();
  });

  it("escapes pipes in values", () => {
    const md = jsonToMarkdown([{ a: "x|y" }]);
    expect(md).toContain("x\\|y");
  });
});
