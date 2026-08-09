import { DOCS_PATHS } from "@/lib/docs/catalog";
import { availableGames } from "@/lib/games";
import { availableTools } from "@/lib/tools";

export const SITE_NAME = "Astraa";
export const SITE_URL = "https://www.astraa.tech";
export const PRIVACY_POLICY_UPDATED_AT = "2026-08-08";

/**
 * Deliberately separate from registry availability. The first complete game
 * must ship with an explicit indexing/content review before this is enabled.
 */
export const GAMES_INDEXING_ENABLED = true;

export const STATIC_INDEXABLE_PATHS: readonly string[] = Object.freeze([
  "/",
  "/tools",
  "/explore",
  "/contribute",
  "/privacy",
]);

export function areGamesIndexable(): boolean {
  return GAMES_INDEXING_ENABLED && availableGames.length > 0;
}

export function getIndexablePaths(): string[] {
  return [
    ...STATIC_INDEXABLE_PATHS,
    ...DOCS_PATHS,
    ...(areGamesIndexable() ? ["/games"] : []),
    ...availableTools.map((tool) => tool.path),
    ...(areGamesIndexable() ? availableGames.map((game) => game.path) : []),
  ];
}

export function toCanonicalUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
