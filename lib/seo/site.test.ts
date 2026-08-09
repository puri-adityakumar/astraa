import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { DOCS_PATHS } from "@/lib/docs/catalog";
import { availableGames, comingSoonGames } from "@/lib/games";
import { availableTools, comingSoonTools } from "@/lib/tools";

import {
  areGamesIndexable,
  GAMES_INDEXING_ENABLED,
  getIndexablePaths,
  PRIVACY_POLICY_UPDATED_AT,
  SITE_URL,
  STATIC_INDEXABLE_PATHS,
} from "./site";

describe("SEO route policy", () => {
  it("requires an explicit games indexing review when availability changes", () => {
    expect(GAMES_INDEXING_ENABLED).toBe(availableGames.length > 0);
    expect(areGamesIndexable()).toBe(GAMES_INDEXING_ENABLED && availableGames.length > 0);
  });

  it("returns each canonical indexable path exactly once", () => {
    const paths = getIndexablePaths();
    const expectedPaths = [
      ...STATIC_INDEXABLE_PATHS,
      ...DOCS_PATHS,
      ...(areGamesIndexable() ? ["/games"] : []),
      ...availableTools.map((tool) => tool.path),
      ...(areGamesIndexable() ? availableGames.map((game) => game.path) : []),
    ];

    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(expectedPaths);
    for (const docsPath of DOCS_PATHS) expect(paths).toContain(docsPath);
    expect(paths).toContain("/games");
    expect(paths).toContain("/games/memory");
    for (const tool of comingSoonTools) expect(paths).not.toContain(tool.path);
    for (const game of comingSoonGames) expect(paths).not.toContain(game.path);
  });

  it("builds a sitemap with only evidence-backed freshness", () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);

    expect(paths).toEqual(getIndexablePaths());
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);

    for (const entry of entries) {
      expect(new URL(entry.url).origin).toBe(SITE_URL);
      expect(entry).not.toHaveProperty("changeFrequency");
      expect(entry).not.toHaveProperty("priority");

      if (new URL(entry.url).pathname === "/privacy") {
        expect(entry.lastModified).toBe(PRIVACY_POLICY_UPDATED_AT);
      } else {
        expect(entry).not.toHaveProperty("lastModified");
      }
    }
  });

  it("allows public pages, blocks API crawling, and declares the sitemap", () => {
    const policy = robots();

    expect(policy.rules).toEqual([{ userAgent: "*", allow: "/", disallow: "/api/" }]);
    expect(policy.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
