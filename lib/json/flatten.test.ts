import { describe, it, expect } from "vitest";
import { flatten, MAX_DEPTH } from "./flatten";

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
  });

  it("does not overflow the stack on deeply nested JSON with all paths expanded", () => {
    // Build {a:{a:{...}}} 200 levels deep — well past MAX_DEPTH and would
    // overflow a real stack without the depth cap.
    const depth = 200;
    let value: unknown = 1;
    for (let i = 0; i < depth; i++) value = { a: value };

    // Expand every level so the walker would try to recurse the full depth.
    const expanded = new Set<string>([""]);
    let path = "";
    for (let i = 0; i < depth; i++) {
      path += i === 0 ? "a" : ".a";
      expanded.add(path);
    }

    // Should resolve (truncated at MAX_DEPTH) rather than throw.
    const rows = flatten(value as never, expanded);
    expect(rows.length).toBeGreaterThan(0);
    // Recursion stops at MAX_DEPTH, so the number of rows is bounded.
    expect(rows.length).toBeLessThanOrEqual(MAX_DEPTH + 1);
    expect(rows[0]?.path).toBe("");
    expect(rows[rows.length - 1]?.depth).toBe(MAX_DEPTH);
  });

  it("renders the depth-capped node as a leaf but stops recursing", () => {
    // MAX_DEPTH nested objects; the node at MAX_DEPTH should still render but
    // not expand into its child.
    let value: unknown = { leaf: "x" };
    for (let i = 0; i < MAX_DEPTH; i++) value = { a: value };

    const expanded = new Set<string>([""]);
    let path = "";
    for (let i = 0; i < MAX_DEPTH + 1; i++) {
      path += i === 0 ? "a" : ".a";
      expanded.add(path);
    }

    const rows = flatten(value as never, expanded);
    // Every node through MAX_DEPTH renders; the child beyond it does not.
    expect(rows.length).toBe(MAX_DEPTH + 1);
    const deepest = rows[rows.length - 1];
    expect(deepest?.depth).toBe(MAX_DEPTH);
    expect(deepest?.hasChildren).toBe(true);
  });
});
