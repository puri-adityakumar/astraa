import { describe, expect, it } from "vitest";
import { homeMetadata, toolMetadataBySlug } from "@/lib/site-metadata";

const EXPECTED_SLUGS = [
  "base64",
  "calculator",
  "currency",
  "hash",
  "image",
  "json",
  "markdown",
  "music",
  "password",
  "regex",
  "snippet-generator",
  "sql",
  "text",
  "units",
];

describe("site-metadata", () => {
  it("exposes exactly the 14 tool slugs", () => {
    expect(Object.keys(toolMetadataBySlug).sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it.each(EXPECTED_SLUGS)(
    "has title, description and canonical for /tools/%s",
    (slug) => {
      const metadata = toolMetadataBySlug[slug];
      expect(metadata).toBeDefined();
      expect(metadata?.title).toBeTruthy();
      expect(metadata?.description).toBeTruthy();
      expect(metadata?.alternates?.canonical).toBe(`/tools/${slug}`);
      expect(metadata?.openGraph?.url).toBe(`/tools/${slug}`);
    },
  );

  it("keeps the home title and canonical", () => {
    expect(homeMetadata.title).toEqual({
      absolute: "Free Online Utility Tools for Developers & Creators",
    });
    expect(homeMetadata.alternates?.canonical).toBe("/");
    expect(homeMetadata.openGraph?.url).toBe("/");
  });
});
