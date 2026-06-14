import { describe, it, expect } from "vitest";
import { jsonToYaml, yamlToJson } from "./yaml";

describe("jsonToYaml", () => {
  it("converts object to YAML", async () => {
    const out = await jsonToYaml({ a: 1, b: "two" });
    expect(out).toContain("a: 1");
    expect(out).toContain("b: two");
  });

  it("converts nested object", async () => {
    const out = await jsonToYaml({ a: { b: 1 } });
    expect(out).toContain("a:");
    expect(out).toContain("  b: 1");
  });
});

describe("yamlToJson", () => {
  it("parses YAML to object", async () => {
    const result = await yamlToJson("a: 1\nb: two");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ a: 1, b: "two" });
  });

  it("returns ok=false on invalid YAML", async () => {
    const result = await yamlToJson("not: valid: yaml: at: all\n  - badly indented");
    expect(typeof result.ok).toBe("boolean");
  });
});
