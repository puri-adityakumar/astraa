import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";

import { availableGames, comingSoonGames, games } from "./games";
import { availableTools, getToolById, tools } from "./tools";

describe("public registry availability", () => {
  it("exposes the reviewed availability counts", () => {
    expect(availableTools).toHaveLength(13);
    expect(availableGames).toHaveLength(1);
    expect(comingSoonGames).toHaveLength(6);
  });

  it("requires stable IDs, paths, status, and processing metadata", () => {
    const entries = [...tools, ...games];

    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.path)).size).toBe(entries.length);

    for (const entry of entries) {
      expect(entry.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.path).toMatch(/^\/(?:tools|games)\/[a-z0-9-]+$/);
      expect(["available", "coming-soon"]).toContain(entry.status);
      expect(["local", "server", "hybrid"]).toContain(entry.processing);
      expect(entry.description.trim().length).toBeGreaterThan(20);
    }
  });

  it("uses the canonical display names for renamed tools", () => {
    expect(getToolById("text")?.name).toBe("AI Text Generator");
    expect(getToolById("calculator")?.name).toBe("Scientific Calculator");
    expect(getToolById("markdown")?.name).toBe("Markdown Editor");
  });

  it("launches SQL as a local formatter without a validation claim", () => {
    const sql = getToolById("sql");

    expect(sql).toMatchObject({ processing: "local", status: "available" });
    expect(sql?.description).toMatch(/format.*in your browser/i);
    expect(sql?.description).not.toMatch(/valid|execute|safe|optimi/i);
  });

  it("launches only Memory as a local browser game", () => {
    expect(availableGames.map((game) => game.id)).toEqual(["memory"]);
    expect(availableGames[0]).toMatchObject({ processing: "local", status: "available" });
    expect(availableGames[0]?.description).toMatch(/in your browser/i);
    expect(comingSoonGames.map((game) => game.id)).not.toContain("memory");
  });

  it("describes local and provider-backed processing boundaries", () => {
    for (const tool of availableTools.filter((entry) => entry.processing === "local")) {
      expect(tool.description).toMatch(/in your browser/i);
    }

    expect(getToolById("text")?.description).toMatch(/Astraa's server.*AI provider/i);
    expect(getToolById("currency")?.description).toMatch(/pair.*rate endpoint.*browser/i);
  });

  it("gives every available tool at least two valid, available related tools", () => {
    for (const tool of availableTools) {
      expect(tool.relatedToolIds.length).toBeGreaterThanOrEqual(2);
      expect(new Set(tool.relatedToolIds).size).toBe(tool.relatedToolIds.length);
      expect(tool.relatedToolIds).not.toContain(tool.id);

      for (const relatedId of tool.relatedToolIds) {
        expect(getToolById(relatedId)?.status).toBe("available");
      }
    }
  });

  it("excludes every coming-soon tool and game route from the sitemap", () => {
    const sitemapUrls = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    const unavailablePaths = [...tools, ...games]
      .filter((item) => item.status === "coming-soon")
      .map((item) => item.path);

    expect(unavailablePaths.length).toBeGreaterThan(0);
    for (const path of unavailablePaths) {
      expect(sitemapUrls.has(path)).toBe(false);
    }
  });
});
