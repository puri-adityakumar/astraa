import { describe, expect, it } from "vitest";

import { createDiagramId, createHeadingSlugger, slugifyHeading } from "./headings";

describe("documentation heading identifiers", () => {
  it.each([
    ["Quick start", "quick-start"],
    ["`GET /api/rates/fiat`", "get-apiratesfiat"],
    ["SEO & accessibility", "seo-accessibility"],
    ["  Duplicate -- spaces  ", "duplicate-spaces"],
    ["🎉", "section"],
  ])("slugifies %s as %s", (heading, expected) => {
    expect(slugifyHeading(heading)).toBe(expected);
  });

  it("adds stable suffixes for duplicate headings", () => {
    const slugger = createHeadingSlugger();
    expect([slugger.slug("Example"), slugger.slug("Example"), slugger.slug("Example")]).toEqual([
      "example",
      "example-1",
      "example-2",
    ]);
  });

  it("creates deterministic diagram identifiers without source content", () => {
    const source = "flowchart LR\nA --> B";
    expect(createDiagramId(source)).toBe(createDiagramId(source));
    expect(createDiagramId(source, 1)).not.toBe(createDiagramId(source));
    expect(createDiagramId(source)).not.toContain("flowchart");
  });
});
