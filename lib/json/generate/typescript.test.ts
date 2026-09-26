import { describe, it, expect } from "vitest";
import { generateTypeScript } from "./typescript";

describe("generateTypeScript", () => {
  it("generates an interface for a flat object", async () => {
    const out = await generateTypeScript('{"name":"a","n":1}', "Root");
    expect(out).toContain("export");
    expect(out).toMatch(/interface|type/);
    expect(out).toContain("name");
  });

  it("uses the provided type name", async () => {
    const out = await generateTypeScript('{"x":1}', "Settings");
    expect(out).toContain("Settings");
  });
});
