import { describe, it, expect } from "vitest";
import { repair } from "./repair";

describe("repair", () => {
  it("fixes trailing comma", async () => {
    const result = await repair('{ "a": 1, }');
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.text)).toEqual({ a: 1 });
  });

  it("fixes single quotes", async () => {
    const result = await repair("{ 'a': 1 }");
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.text)).toEqual({ a: 1 });
  });

  it("fixes unquoted keys", async () => {
    const result = await repair("{ a: 1 }");
    expect(result.ok).toBe(true);
    if (result.ok) expect(JSON.parse(result.text)).toEqual({ a: 1 });
  });

  it("returns ok=false on unrecoverable input", async () => {
    const result = await repair("{{{{{");
    expect(result.ok).toBe(false);
  });
});
