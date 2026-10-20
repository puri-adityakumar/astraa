import type { Game } from "@/lib/games";

export interface GameRow {
  name: string;
  path: string;
  comingSoon: boolean;
}

/** Keep the game registry's order and treat an omitted comingSoon flag as live. */
export function gameRows(
  games: readonly Pick<Game, "name" | "path" | "comingSoon">[],
): GameRow[] {
  return games.map((game) => ({
    name: game.name,
    path: game.path,
    comingSoon: game.comingSoon ?? false,
  }));
}
