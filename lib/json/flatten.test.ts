import { describe, it, expect } from "vitest";
import { flatten, MAX_TREE_DEPTH } from "./flatten";
import { joinPath } from "./paths";
import type { JsonValue } from "./types";

function nested(depth: number): JsonValue {
  let value: JsonValue = 1;
  for (let i = 0; i < depth; i++) value = { a: value };
  return value;
}

function expandedChain(depth: number): Set<string> {
  const paths = new Set<string>([""]);
  let path = "";
  for (let i = 0; i < depth; i++) {
    path = joinPath(path, "a");
    paths.add(path);
  }
  return paths;
}

describe("flatten", () => {
  it("returns one row for primitive", () => {
    const rows = flatten(42, new Set());
    expect(rows).toHaveLength(1);
    expect(rows[0]?.type).toBe("number");
  });

  it("returns root row + children for expanded object", () => {
    const rows = flatten({ a: 1, b: 2 }, new Set([""]));
    expect(rows).toHaveLength(3); // root + a + b
    expect(rows[0]?.path).toBe("");
    expect(rows[1]?.path).toBe("a");
  });

  it("returns only root row when not expanded", () => {
    const rows = flatten({ a: 1, b: 2 }, new Set());
    expect(rows).toHaveLength(1);
    expect(rows[0]?.hasChildren).toBe(true);
    expect(rows[0]?.isExpanded).toBe(false);
  });

  it("recurses for expanded nested objects", () => {
    const rows = flatten({ a: { b: 1 } }, new Set(["", "a"]));
    expect(rows.map((r) => r.path)).toEqual(["", "a", "a.b"]);
  });

  it("uses bracket notation for arrays", () => {
    const rows = flatten({ a: [10, 20] }, new Set(["", "a"]));
    expect(rows.map((r) => r.path)).toEqual(["", "a", "a[0]", "a[1]"]);
  });

  it("preview shows shortened string", () => {
    const rows = flatten("hello world", new Set());
    expect(rows[0]?.preview).toContain("hello");
  });

  it("preview shows childCount for collapsed object", () => {
    const rows = flatten({ a: 1, b: 2, c: 3 }, new Set());
    expect(rows[0]?.childCount).toBe(3);
    expect(rows[0]?.depthLimited).toBeUndefined();
  });

  it("stops walking at the depth cap and marks the limit row", () => {
    const depth = MAX_TREE_DEPTH + 24;
    const rows = flatten(nested(depth), expandedChain(depth));
    expect(rows).toHaveLength(MAX_TREE_DEPTH + 1);
    const last = rows[rows.length - 1];
    expect(last?.depth).toBe(MAX_TREE_DEPTH);
    expect(last?.depthLimited).toBe(true);
    expect(last?.hasChildren).toBe(false);
    expect(last?.isExpanded).toBe(false);
    expect(last?.childCount).toBe(1);
    expect(rows.some((r) => r.depth > MAX_TREE_DEPTH)).toBe(false);
  });

  it("does not recurse past the cap when every path reports expanded", () => {
    const expandAll = { has: () => true } as unknown as ReadonlySet<string>;
    expect(() => flatten(nested(20_000), expandAll)).not.toThrow();
    expect(flatten(nested(20_000), expandAll)).toHaveLength(MAX_TREE_DEPTH + 1);
  });
});
