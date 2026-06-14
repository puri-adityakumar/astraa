import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize";

describe("tokenize", () => {
  it("tokenizes \\d+ as escape + quantifier", () => {
    const { tokens, balanced } = tokenize("\\d+");
    expect(balanced).toBe(true);
    expect(tokens).toHaveLength(2);
    expect(tokens[0]?.type).toBe("escape");
    expect(tokens[0]?.value).toBe("\\d");
    expect(tokens[0]?.startIndex).toBe(0);
    expect(tokens[0]?.endIndex).toBe(2);
    expect(tokens[1]?.type).toBe("quantifier");
    expect(tokens[1]?.value).toBe("+");
  });

  it("tokenizes (?<name>a) as namedGroupOpen + literal + groupClose", () => {
    const { tokens, balanced } = tokenize("(?<name>a)");
    expect(balanced).toBe(true);
    expect(tokens).toHaveLength(3);
    expect(tokens[0]?.type).toBe("namedGroupOpen");
    expect(tokens[0]?.value).toBe("(?<name>");
    expect(tokens[1]?.type).toBe("literal");
    expect(tokens[1]?.value).toBe("a");
    expect(tokens[2]?.type).toBe("groupClose");
    expect(tokens[2]?.value).toBe(")");
  });

  it("tokenizes [a-z] as charClassOpen + range + charClassClose", () => {
    const { tokens, balanced } = tokenize("[a-z]");
    expect(balanced).toBe(true);
    expect(tokens).toHaveLength(3);
    expect(tokens[0]?.type).toBe("charClassOpen");
    expect(tokens[0]?.value).toBe("[");
    expect(tokens[1]?.type).toBe("range");
    expect(tokens[1]?.value).toBe("a-z");
    expect(tokens[2]?.type).toBe("charClassClose");
    expect(tokens[2]?.value).toBe("]");
  });

  it("tokenizes (?=foo) as lookaheadPositive", () => {
    const { tokens, balanced } = tokenize("(?=foo)");
    expect(balanced).toBe(true);
    expect(tokens[0]?.type).toBe("lookaheadPositive");
    expect(tokens[0]?.value).toBe("(?=");
    expect(tokens.at(-1)?.type).toBe("groupClose");
  });

  it("tokenizes (?!foo) as lookaheadNegative", () => {
    const { tokens } = tokenize("(?!foo)");
    expect(tokens[0]?.type).toBe("lookaheadNegative");
    expect(tokens[0]?.value).toBe("(?!");
  });

  it("tokenizes (?<=foo) as lookbehindPositive", () => {
    const { tokens } = tokenize("(?<=foo)");
    expect(tokens[0]?.type).toBe("lookbehindPositive");
    expect(tokens[0]?.value).toBe("(?<=");
  });

  it("tokenizes (?<!foo) as lookbehindNegative", () => {
    const { tokens } = tokenize("(?<!foo)");
    expect(tokens[0]?.type).toBe("lookbehindNegative");
    expect(tokens[0]?.value).toBe("(?<!");
  });

  it("tokenizes (?:foo) as nonCaptureGroupOpen", () => {
    const { tokens } = tokenize("(?:foo)");
    expect(tokens[0]?.type).toBe("nonCaptureGroupOpen");
    expect(tokens[0]?.value).toBe("(?:");
  });

  it("flags balanced false for (abc", () => {
    const { balanced } = tokenize("(abc");
    expect(balanced).toBe(false);
  });

  it("flags balanced false for [abc", () => {
    const { balanced } = tokenize("[abc");
    expect(balanced).toBe(false);
  });

  it("tracks depth for nested groups ((a)b)", () => {
    const { tokens, balanced } = tokenize("((a)b)");
    expect(balanced).toBe(true);
    // ( ( a ) b )
    expect(tokens[0]?.type).toBe("groupOpen");
    expect(tokens[0]?.depth).toBe(0);
    expect(tokens[1]?.type).toBe("groupOpen");
    expect(tokens[1]?.depth).toBe(1);
    expect(tokens[2]?.type).toBe("literal");
    expect(tokens[2]?.depth).toBe(2);
    expect(tokens[3]?.type).toBe("groupClose");
    expect(tokens[3]?.depth).toBe(1);
    expect(tokens[4]?.type).toBe("literal");
    expect(tokens[4]?.depth).toBe(1);
    expect(tokens[5]?.type).toBe("groupClose");
    expect(tokens[5]?.depth).toBe(0);
  });

  it("recognizes anchors ^ and $", () => {
    const { tokens } = tokenize("^abc$");
    expect(tokens[0]?.type).toBe("anchorStart");
    expect(tokens.at(-1)?.type).toBe("anchorEnd");
  });

  it("recognizes word boundary \\b and non-word boundary \\B", () => {
    const { tokens } = tokenize("\\bfoo\\B");
    expect(tokens[0]?.type).toBe("wordBoundary");
    expect(tokens.at(-1)?.type).toBe("nonWordBoundary");
  });

  it("recognizes backreference \\1", () => {
    const { tokens } = tokenize("(a)\\1");
    const back = tokens.find((t) => t.type === "backreference");
    expect(back?.value).toBe("\\1");
  });

  it("recognizes alternation |", () => {
    const { tokens } = tokenize("a|b");
    expect(tokens[1]?.type).toBe("alternation");
    expect(tokens[1]?.value).toBe("|");
  });

  it("recognizes braced quantifier {2,5}", () => {
    const { tokens } = tokenize("a{2,5}");
    expect(tokens[1]?.type).toBe("quantifier");
    expect(tokens[1]?.value).toBe("{2,5}");
  });

  it("recognizes lazy quantifier *?", () => {
    const { tokens } = tokenize("a*?");
    expect(tokens[1]?.type).toBe("quantifier");
    expect(tokens[1]?.value).toBe("*?");
  });

  it("treats backslash-escape inside class as escape token", () => {
    const { tokens, balanced } = tokenize("[\\d]");
    expect(balanced).toBe(true);
    expect(tokens[0]?.type).toBe("charClassOpen");
    expect(tokens[1]?.type).toBe("escape");
    expect(tokens[1]?.value).toBe("\\d");
    expect(tokens[2]?.type).toBe("charClassClose");
  });

  it("assigns unique ids to each token", () => {
    const { tokens } = tokenize("a|b|c");
    const ids = new Set(tokens.map((t) => t.id));
    expect(ids.size).toBe(tokens.length);
  });
});
