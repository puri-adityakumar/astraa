import { describe, expect, it } from "vitest";

import { getProjectLink, PROJECT_LINKS } from "./project-links";

describe("project links", () => {
  it("exposes the exact immutable site destination contract", () => {
    expect(PROJECT_LINKS).toEqual([
      expect.objectContaining({ key: "docs", label: "Docs", siteHref: "/docs" }),
      expect.objectContaining({
        key: "roadmap",
        label: "Roadmap",
        siteHref: "https://astraa.notion.site/roadmap",
      }),
      expect.objectContaining({
        key: "changelog",
        label: "Changelog",
        siteHref: "https://astraa.notion.site/changelog",
      }),
      expect.objectContaining({
        key: "hallOfFame",
        label: "Hall of Fame",
        siteHref: "https://astraa.notion.site/documentation",
      }),
      expect.objectContaining({ key: "privacy", label: "Privacy", siteHref: "/privacy" }),
    ]);
    expect(Object.isFrozen(PROJECT_LINKS)).toBe(true);
    expect(PROJECT_LINKS.every(Object.isFrozen)).toBe(true);
    expect(new Set(PROJECT_LINKS.map((link) => link.label)).size).toBe(PROJECT_LINKS.length);
    expect(new Set(PROJECT_LINKS.map((link) => link.siteHref)).size).toBe(PROJECT_LINKS.length);
  });

  it("keeps site and README destinations intentionally distinct only for Docs and Privacy", () => {
    expect(getProjectLink("docs")?.readmeHref).toBe("https://www.astraa.tech/docs");
    expect(getProjectLink("privacy")?.readmeHref).toBeNull();
    for (const link of PROJECT_LINKS.filter((entry) => entry.kind === "external")) {
      expect(link.readmeHref).toBe(link.siteHref);
    }
    expect(getProjectLink("unknown")).toBeUndefined();
  });
});
