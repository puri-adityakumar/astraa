import { describe, expect, it, vi } from "vitest";

import { DOCS_CATALOG } from "./catalog";

vi.mock("server-only", () => ({}));

describe("documentation content loader", () => {
  it("maps every manifest source key to one fixed readable source", async () => {
    const { getAllowedDocsSourceKeys, loadDocsContent } = await import("./content");

    expect(new Set(getAllowedDocsSourceKeys())).toEqual(
      new Set(DOCS_CATALOG.map((entry) => entry.sourceKey)),
    );
    for (const entry of DOCS_CATALOG) {
      const result = await loadDocsContent(entry.slug);
      expect(result.status).toBe("found");
      if (result.status === "found") {
        expect(result.entry).toEqual(entry);
        expect(result.markdown).toMatch(/^# /);
      }
    }
  });

  it.each(["nope", "../README", "architecture/../../README", "%2e%2e%2fREADME"])(
    "returns typed not-found state without reading traversal-like slug %s",
    async (slug) => {
      const { loadDocsContent } = await import("./content");
      await expect(loadDocsContent(slug)).resolves.toEqual({ status: "not-found" });
    },
  );

  it("keeps available-tool guidance count-free as the catalog changes", async () => {
    const { loadDocsContent } = await import("./content");
    const result = await loadDocsContent("seo");

    expect(result.status).toBe("found");
    if (result.status !== "found") return;

    expect(result.markdown).toContain(
      "Every available tool includes unique server-rendered guidance and contextual,",
    );
    expect(result.markdown).not.toContain("Nine high-utility tools");
    expect(result.markdown).not.toMatch(
      /\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:high-utility\s+)?tools?\b/i,
    );
  });

  it("documents the fixed Markdown rendering boundary in the canonical architecture source", async () => {
    const { loadDocsContent } = await import("./content");
    const result = await loadDocsContent("architecture");

    expect(result.status).toBe("found");
    if (result.status !== "found") return;

    expect(result.markdown).toContain("## Documentation rendering");
    expect(result.markdown).toMatch(/fixed\s+allowlist of absolute files/);
    expect(result.markdown).toContain("skipping raw HTML");
    expect(result.markdown).toContain("Mermaid fences are the only strict optional client island");
    expect(result.markdown).toContain("Only `sitemap.ts` consumes `getIndexablePaths()`");
  });
});
