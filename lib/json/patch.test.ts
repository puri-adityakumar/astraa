import { describe, it, expect } from "vitest";
import { applyPatch } from "./patch";

describe("applyPatch", () => {
  it("set replaces value at root", () => {
    const result = applyPatch({ a: 1 }, "", "set", 42);
    expect(result).toBe(42);
  });

  it("set replaces value at nested path", () => {
    const result = applyPatch({ a: { b: 1 } }, "a.b", "set", 2);
    expect(result).toEqual({ a: { b: 2 } });
  });

  it("set replaces value at array index", () => {
    const result = applyPatch({ a: [1, 2, 3] }, "a[1]", "set", 99);
    expect(result).toEqual({ a: [1, 99, 3] });
  });

  it("remove deletes object key", () => {
    const result = applyPatch({ a: 1, b: 2 }, "a", "remove");
    expect(result).toEqual({ b: 2 });
  });

  it("remove deletes array index", () => {
    const result = applyPatch({ a: [1, 2, 3] }, "a[1]", "remove");
    expect(result).toEqual({ a: [1, 3] });
  });

  it("add appends to array", () => {
    const result = applyPatch({ a: [1, 2] }, "a", "add", 3);
    expect(result).toEqual({ a: [1, 2, 3] });
  });

  it("add inserts new key with default", () => {
    const result = applyPatch({}, "x", "add", "hello");
    expect(result).toEqual({ x: "hello" });
  });

  it("does not mutate input", () => {
    const input = { a: 1 };
    applyPatch(input, "a", "set", 2);
    expect(input).toEqual({ a: 1 });
  });
});
