import { describe, expect, it } from "vitest";

import { availableGames, comingSoonGames } from "@/lib/games";
import { availableTools, comingSoonTools, getToolById, localTools } from "@/lib/tools";

import { HOME_CATALOG_COUNTS, HOME_FEATURED_TOOL_IDS } from "./home-content";

describe("homepage registry content", () => {
  it("features unique available tool IDs", () => {
    expect(new Set(HOME_FEATURED_TOOL_IDS).size).toBe(HOME_FEATURED_TOOL_IDS.length);

    for (const id of HOME_FEATURED_TOOL_IDS) {
      const tool = getToolById(id);
      expect(tool, `Missing homepage tool: ${id}`).toBeDefined();
      expect(tool?.status, `Homepage tool is not available: ${id}`).toBe("available");
    }
  });

  it("derives catalog boundaries from the live registries", () => {
    expect(HOME_CATALOG_COUNTS).toEqual({
      available: availableTools.length,
      local: localTools.length,
      providerBacked: availableTools.filter((tool) => tool.processing !== "local").length,
      availableGames: availableGames.length,
      plannedTools: comingSoonTools.length,
      plannedGames: comingSoonGames.length,
    });
  });
});
