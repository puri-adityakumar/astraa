import { describe, it, expect } from "vitest";
import { flatten } from "./flatten";

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
});
