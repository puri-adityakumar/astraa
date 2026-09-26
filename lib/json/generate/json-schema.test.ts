import { describe, it, expect } from "vitest";
import { generateJsonSchema } from "./json-schema";

describe("generateJsonSchema", () => {
  it("infers schema for primitives", () => {
    const s = generateJsonSchema("hello");
    expect(s.type).toBe("string");
  });

  it("infers schema for object", () => {
    const s = generateJsonSchema({ a: 1, b: "x" }) as Record<string, unknown>;
    expect(s.type).toBe("object");
    expect((s.properties as Record<string, { type: string }>).a!.type).toBe("integer");
    expect((s.properties as Record<string, { type: string }>).b!.type).toBe("string");
  });

  it("infers schema for array of strings", () => {
    const s = generateJsonSchema(["a", "b"]) as Record<string, unknown>;
    expect(s.type).toBe("array");
    expect((s.items as { type: string }).type).toBe("string");
  });

  it("infers schema for null as null type", () => {
    const s = generateJsonSchema(null);
    expect(s.type).toBe("null");
  });

  it("integer vs number distinction", () => {
    expect(generateJsonSchema(1).type).toBe("integer");
    expect(generateJsonSchema(1.5).type).toBe("number");
  });
});
