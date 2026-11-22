import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Gamepad2 } from "lucide-react";
import { availableGames, games } from "./games";
import type { Game } from "./games";

const SITE_GAMES_DIR = join(process.cwd(), "app", "(site)", "games");

function routePageExists(gamePath: string): boolean {
  const slug = gamePath.replace(/^\/games\//, "");
  return existsSync(join(SITE_GAMES_DIR, slug, "page.tsx"));
}

describe("games registry", () => {
  it("keeps every path inside /games and unique", () => {
    const paths = games.map((game) => game.path);
    expect(paths.every((gamePath) => gamePath.startsWith("/games/"))).toBe(true);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("never lists a game as available without a shipped route page", () => {
    const phantom = games
      .filter((game) => !game.comingSoon)
      .filter((game) => !routePageExists(game.path))
      .map((game) => game.path);

    expect(phantom).toEqual([]);
  });

  it("does not register a 2048 route that the app does not serve", () => {
    expect(games.find((game) => game.path === "/games/2048")).toBeUndefined();
  });
});

describe("availableGames", () => {
  const registry: Game[] = [
    { name: "Live", description: "shipped", path: "/games/live", icon: Gamepad2 },
    {
      name: "Soon",
      description: "under construction",
      path: "/games/soon",
      icon: Gamepad2,
      comingSoon: true,
    },
    {
      name: "Also Live",
      description: "shipped",
      path: "/games/also-live",
      icon: Gamepad2,
      comingSoon: false,
    },
  ];

  it("returns only non-coming-soon games in registry order", () => {
    expect(availableGames(registry).map((game) => game.name)).toEqual([
      "Live",
      "Also Live",
    ]);
  });

  it("defaults to the site registry and preserves the source objects", () => {
    expect(availableGames()).toEqual(games.filter((game) => !game.comingSoon));
  });
});
