import { describe, expect, it } from "vitest";
import { emitCode } from "./code-emit";

describe("emitCode", () => {
  const pattern = "\\d+";
  const flags = "gi";

  it("emits a JavaScript RegExp literal", () => {
    const out = emitCode(pattern, flags, "js");
    expect(out).toContain("/\\d+/gi");
    expect(out).toContain("input.match(re)");
  });

  it("escapes slashes in JS literals", () => {
    const out = emitCode("a/b", "g", "js");
    expect(out).toContain("/a\\/b/g");
  });

  it("emits Python with mapped flags", () => {
    const out = emitCode(pattern, flags, "python");
    expect(out).toContain("import re");
    expect(out).toContain('r"\\d+"');
    expect(out).toContain("re.IGNORECASE");
  });

  it("emits Java with mapped flags", () => {
    const out = emitCode(pattern, flags, "java");
    expect(out).toContain("Pattern.compile");
    expect(out).toContain("Pattern.CASE_INSENSITIVE");
    expect(out).toContain("\"\\\\d+\"");
  });

  it("emits Go with inline flags", () => {
    const out = emitCode(pattern, flags, "go");
    expect(out).toContain("regexp.MustCompile");
    expect(out).toContain("(?i)\\d+");
    expect(out).toContain("FindAllString");
  });

  it("emits PHP using preg_match_all when global", () => {
    const out = emitCode(pattern, flags, "php");
    expect(out).toContain("'/\\d+/gi'");
    expect(out).toContain("preg_match_all");
  });

  it("returns placeholder when pattern empty", () => {
    expect(emitCode("", "g", "js")).toContain("Enter a pattern");
  });
});
