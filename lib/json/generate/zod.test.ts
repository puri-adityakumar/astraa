import { describe, it, expect } from "vitest";
import { generateZod } from "./zod";

describe("generateZod", () => {
  it("generates Zod schema for a flat object", async () => {
    const out = await generateZod('{"name":"a","n":1}', "Root");
    expect(out).toContain("z.object");
    expect(out).toContain("Root");
  });
});
