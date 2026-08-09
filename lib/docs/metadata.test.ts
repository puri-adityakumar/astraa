import { describe, expect, it } from "vitest";

import { DOCS_CATALOG } from "./catalog";
import { createDocsMetadata } from "./metadata";

describe("documentation metadata", () => {
  it("uses each manifest entry as the unbranded canonical source", () => {
    const metadata = DOCS_CATALOG.map(createDocsMetadata);

    expect(new Set(metadata.map((entry) => entry.title)).size).toBe(DOCS_CATALOG.length);
    expect(new Set(metadata.map((entry) => entry.description)).size).toBe(DOCS_CATALOG.length);
    for (const [index, entry] of metadata.entries()) {
      const source = DOCS_CATALOG[index];
      expect(entry).toMatchObject({
        title: source?.title,
        description: source?.description,
        alternates: { canonical: source?.route },
        openGraph: {
          title: source?.title,
          description: source?.description,
          url: source?.route,
        },
        robots: { index: true, follow: true },
        twitter: { title: source?.title, description: source?.description },
      });
      expect(String(entry.title)).not.toContain("Astraa");
    }
  });
});
