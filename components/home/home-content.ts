import { availableGames, comingSoonGames } from "@/lib/games";
import { availableTools, comingSoonTools, getToolById, localTools } from "@/lib/tools";

import type { Tool, ToolId } from "@/lib/tools";

export const HOME_FEATURED_TOOL_IDS = [
  "json",
  "image",
  "regex",
  "currency",
] as const satisfies readonly ToolId[];

function requireAvailableTool(id: ToolId): Tool {
  const tool = getToolById(id);
  if (!tool || tool.status !== "available") {
    throw new Error(`Homepage tool ${id} must resolve to an available registry entry.`);
  }
  return tool;
}

export const HOME_FEATURED_TOOLS = HOME_FEATURED_TOOL_IDS.map(requireAvailableTool);

export const HOME_PLANNED_TOOLS = comingSoonTools;
export const HOME_PLANNED_GAMES = comingSoonGames;

export const HOME_CATALOG_COUNTS = Object.freeze({
  available: availableTools.length,
  local: localTools.length,
  providerBacked: availableTools.filter((tool) => tool.processing !== "local").length,
  availableGames: availableGames.length,
  plannedTools: comingSoonTools.length,
  plannedGames: comingSoonGames.length,
});
