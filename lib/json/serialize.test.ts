import { describe, it, expect } from "vitest";
import { serialize } from "./serialize";

describe("serialize", () => {
  it("serializes with 2-space indent", () => {
    const out = serialize({ a: 1 }, { indent: 2, sortKeys: false });
    expect(out).toBe('{\n  "a": 1\n}');
  });

  it("serializes with 4-space indent", () => {
    const out = serialize({ a: 1 }, { indent: 4, sortKeys: false });
    expect(out).toBe('{\n    "a": 1\n}');
  });

  it("serializes with tab indent", () => {
    const out = serialize({ a: 1 }, { indent: "tab", sortKeys: false });
    expect(out).toBe('{\n\t"a": 1\n}');
  });

  it("sortKeys=true sorts keys alphabetically", () => {
    const out = serialize({ b: 2, a: 1 }, { indent: 2, sortKeys: true });
    expect(out).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it("sortKeys=false preserves insertion order", () => {
    const out = serialize({ b: 2, a: 1 }, { indent: 2, sortKeys: false });
    expect(out).toBe('{\n  "b": 2,\n  "a": 1\n}');
  });

  it("sortKeys recursively sorts nested objects", () => {
    const out = serialize({ b: 2, a: { z: 1, y: 2 } }, { indent: 2, sortKeys: true });
    expect(out).toContain('"a": {\n    "y": 2,\n    "z": 1\n  }');
  });

  it("preserves __proto__ keys while sorting at every depth", () => {
    const value = JSON.parse("{\"z\":1,\"__proto__\":{\"z\":2,\"__proto__\":3,\"a\":4}}");
    const output = serialize(value, { indent: 2, sortKeys: true });
    expect(JSON.parse(output)).toEqual(value);
    expect(output).toContain("\"__proto__\": 3");
    expect(output.indexOf("\"__proto__\"")).toBeLessThan(output.indexOf("\"z\""));
  });
});
