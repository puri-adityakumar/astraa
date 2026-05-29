import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize";
import { buildExplainTree } from "./explain";
import type { ExplainNode } from "./types";

function flatten(nodes: ExplainNode[]): ExplainNode[] {
  const out: ExplainNode[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children) out.push(...flatten(n.children));
  }
  return out;
}

describe("buildExplainTree", () => {
  it("labels \\d as Digit class with detail", () => {
    const { tokens } = tokenize("\\d");
    const tree = buildExplainTree(tokens);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.label).toBe("Digit class");
    expect(tree[0]?.detail).toMatch(/digit/i);
    expect(tree[0]?.sourceRange).toEqual([0, 2]);
  });

  it("labels quantifier + with a human label", () => {
    const { tokens } = tokenize("a+");
    const tree = buildExplainTree(tokens);
    const quant = tree.find((n) => n.label.toLowerCase().includes("quantifier"));
    expect(quant).toBeDefined();
    expect(quant?.detail).toMatch(/one or more/i);
  });

  it("nests group children under group node", () => {
    const { tokens } = tokenize("(abc)");
    const tree = buildExplainTree(tokens);
    expect(tree).toHaveLength(1);
    const group = tree[0];
    expect(group?.label).toMatch(/group/i);
    expect(group?.children?.length).toBeGreaterThan(0);
    expect(group?.sourceRange[0]).toBe(0);
    expect(group?.sourceRange[1]).toBe(5);
  });

  it("nests nested groups ((a)b) into two levels", () => {
    const { tokens } = tokenize("((a)b)");
    const tree = buildExplainTree(tokens);
    expect(tree).toHaveLength(1);
    const outer = tree[0];
    expect(outer?.children?.length).toBeGreaterThan(0);
    const innerGroup = outer?.children?.find((c) => c.label.toLowerCase().includes("group"));
    expect(innerGroup).toBeDefined();
    expect(innerGroup?.children?.length).toBeGreaterThan(0);
  });

  it("labels anchors ^ and $", () => {
    const { tokens } = tokenize("^a$");
    const tree = buildExplainTree(tokens);
    const labels = flatten(tree).map((n) => n.label.toLowerCase());
    expect(labels.some((l) => l.includes("start"))).toBe(true);
    expect(labels.some((l) => l.includes("end"))).toBe(true);
  });

  it("labels alternation", () => {
    const { tokens } = tokenize("a|b");
    const tree = buildExplainTree(tokens);
    const alt = flatten(tree).find((n) => n.label.toLowerCase().includes("alternat"));
    expect(alt).toBeDefined();
  });

  it("labels character class with range child", () => {
    const { tokens } = tokenize("[a-z]");
    const tree = buildExplainTree(tokens);
    expect(tree).toHaveLength(1);
    const cls = tree[0];
    expect(cls?.label.toLowerCase()).toContain("character class");
    expect(cls?.children?.length).toBeGreaterThan(0);
    const range = cls?.children?.find((c) => c.label.toLowerCase().includes("range"));
    expect(range).toBeDefined();
    expect(range?.detail).toContain("a");
    expect(range?.detail).toContain("z");
  });

  it("labels lookaheads and lookbehinds with sign", () => {
    const pos = buildExplainTree(tokenize("(?=foo)").tokens);
    expect(pos[0]?.label.toLowerCase()).toContain("positive lookahead");

    const neg = buildExplainTree(tokenize("(?!foo)").tokens);
    expect(neg[0]?.label.toLowerCase()).toContain("negative lookahead");

    const lbp = buildExplainTree(tokenize("(?<=foo)").tokens);
    expect(lbp[0]?.label.toLowerCase()).toContain("positive lookbehind");

    const lbn = buildExplainTree(tokenize("(?<!foo)").tokens);
    expect(lbn[0]?.label.toLowerCase()).toContain("negative lookbehind");
  });

  it("labels named group with the captured name", () => {
    const { tokens } = tokenize("(?<year>\\d{4})");
    const tree = buildExplainTree(tokens);
    expect(tree[0]?.label.toLowerCase()).toContain("named group");
    expect(tree[0]?.detail).toContain("year");
  });

  it("labels word boundary and non-word boundary", () => {
    const { tokens } = tokenize("\\b\\B");
    const tree = buildExplainTree(tokens);
    expect(tree[0]?.label.toLowerCase()).toContain("word boundary");
    expect(tree[1]?.label.toLowerCase()).toContain("non-word boundary");
  });

  it("labels backreference with the group number", () => {
    const { tokens } = tokenize("(a)\\1");
    const tree = buildExplainTree(tokens);
    const back = flatten(tree).find((n) => n.label.toLowerCase().includes("backreference"));
    expect(back).toBeDefined();
    expect(back?.detail).toContain("1");
  });

  it("labels literal characters", () => {
    const { tokens } = tokenize("a");
    const tree = buildExplainTree(tokens);
    expect(tree).toHaveLength(1);
    expect(tree[0]?.label.toLowerCase()).toContain("literal");
    expect(tree[0]?.detail).toContain("a");
  });

  it("returns empty tree for empty token list", () => {
    expect(buildExplainTree([])).toEqual([]);
  });

  it("gives every node a unique id", () => {
    const { tokens } = tokenize("(a|b)+c");
    const tree = buildExplainTree(tokens);
    const ids = flatten(tree).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
