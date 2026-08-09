import { describe, expect, it } from "vitest";

import {
  DOCS_CATALOG,
  DOCS_CHILDREN,
  DOCS_PATHS,
  getDocsEntryByRoute,
  getDocsEntryBySlug,
  resolveDocsLink,
} from "./catalog";

describe("documentation catalog", () => {
  it("owns seven immutable, unique, ordered routes and sources", () => {
    expect(DOCS_CATALOG).toHaveLength(7);
    expect(Object.isFrozen(DOCS_CATALOG)).toBe(true);
    expect(DOCS_CATALOG.every(Object.isFrozen)).toBe(true);

    for (const field of [
      "slug",
      "route",
      "sourceKey",
      "source",
      "order",
      "title",
      "description",
    ] as const) {
      expect(new Set(DOCS_CATALOG.map((entry) => entry[field])).size).toBe(DOCS_CATALOG.length);
    }

    expect(DOCS_CATALOG.map((entry) => entry.order)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(DOCS_PATHS).toEqual(DOCS_CATALOG.map((entry) => entry.route));
    expect(DOCS_CHILDREN).toEqual(DOCS_CATALOG.slice(1));
  });

  it("looks up only exact slugs and routes", () => {
    expect(getDocsEntryBySlug("architecture")?.source).toBe("docs/ARCHITECTURE.md");
    expect(getDocsEntryByRoute("/docs/server-interfaces")?.sourceKey).toBe("serverInterfaces");
    expect(getDocsEntryBySlug("../ARCHITECTURE.md")).toBeUndefined();
    expect(getDocsEntryBySlug("architecture/../../README")).toBeUndefined();
    expect(getDocsEntryByRoute("/docs/nope")).toBeUndefined();
  });
});

describe("documentation links", () => {
  it.each([
    ["./ARCHITECTURE.md", "/docs/architecture"],
    ["COMPONENTS.md", "/docs/components"],
    ["./API.md#generatetext-server-action", "/docs/server-interfaces#generatetext-server-action"],
    ["./README.md#quick-start", "/docs#quick-start"],
    ["/privacy", "/privacy"],
  ])("rewrites %s to %s", (href, expected) => {
    expect(resolveDocsLink(href, "overview")).toMatchObject({
      href: expected,
      kind: "internal",
    });
  });

  it("preserves safe anchors and identifies safe external links", () => {
    expect(resolveDocsLink("#remote-data", "architecture")).toEqual({
      href: "#remote-data",
      kind: "anchor",
    });
    expect(resolveDocsLink("https://github.com/puri-adityakumar/astraa", "overview")).toEqual({
      href: "https://github.com/puri-adityakumar/astraa",
      kind: "external",
    });
  });

  it.each([
    "../CONTRIBUTING.md",
    "./NOPE.md",
    "./%2e%2e/CONTRIBUTING.md",
    "./ARCHITECTURE.md?raw=1",
    "javascript:alert(1)",
    "data:text/html,hello",
    "//example.com/docs.md",
    "./nested\\ARCHITECTURE.md",
  ])("rejects an unallowlisted or unsafe link %s", (href) => {
    expect(resolveDocsLink(href, "overview")).toEqual({ kind: "rejected" });
  });
});
