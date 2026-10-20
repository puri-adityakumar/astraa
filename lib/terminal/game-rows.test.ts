import { describe, expect, it } from "vitest";
import { games } from "@/lib/games";
import { gameRows } from "./game-rows";

describe("terminal game rows", () => {
  it("handles an empty registry", () => {
    expect(gameRows([])).toEqual([]);
  });

  it("keeps names, routes and order while normalizing availability", () => {
    const entries = [
      { name: "Soon", path: "/games/soon", comingSoon: true },
      { name: "Live", path: "/games/live", comingSoon: false },
      { name: "Default", path: "/games/default" },
    ];
    const original = structuredClone(entries);

    expect(gameRows(entries)).toEqual([
      { name: "Soon", path: "/games/soon", comingSoon: true },
      { name: "Live", path: "/games/live", comingSoon: false },
      { name: "Default", path: "/games/default", comingSoon: false },
    ]);
    expect(entries).toEqual(original);
  });

  it("derives every registered game without exposing coming-soon links as live", () => {
    expect(gameRows(games)).toEqual(
      games.map(({ name, path, comingSoon }) => ({
        name,
        path,
        comingSoon: comingSoon ?? false,
      })),
    );
    expect(gameRows(games).every((game) => game.comingSoon)).toBe(true);
  });
});
