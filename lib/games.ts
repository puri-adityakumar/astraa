import { Gamepad2, Brain, Dices } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { isAvailable, isComingSoon } from "@/lib/catalog";
import type { CatalogEntry } from "@/lib/catalog";

const GAME_IDS = ["snake", "dino", "pacman", "memory", "sudoku", "word-search", "2048"] as const;

type GameId = (typeof GAME_IDS)[number];

export type Game = CatalogEntry & {
  id: GameId;
  icon: LucideIcon;
};

export const games: Game[] = [
  // Arcade Games
  {
    id: "snake",
    name: "Snake",
    description: "A planned browser version of the classic Snake game",
    path: "/games/snake",
    icon: Gamepad2,
    status: "coming-soon",
    processing: "local",
  },
  {
    id: "dino",
    name: "Dino Jump",
    description: "A planned offline-style dinosaur runner",
    path: "/games/dino",
    icon: Gamepad2,
    status: "coming-soon",
    processing: "local",
  },
  {
    id: "pacman",
    name: "Pacman",
    description: "A planned browser maze game inspired by arcade classics",
    path: "/games/pacman",
    icon: Gamepad2,
    status: "coming-soon",
    processing: "local",
  },

  // Puzzle Games
  {
    id: "memory",
    name: "Memory Game",
    description: "Match eight symbol pairs in a local game that runs entirely in your browser",
    path: "/games/memory",
    icon: Brain,
    status: "available",
    processing: "local",
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "A planned number-placement puzzle",
    path: "/games/sudoku",
    icon: Brain,
    status: "coming-soon",
    processing: "local",
  },
  {
    id: "word-search",
    name: "Word Search",
    description: "A planned hidden-word grid puzzle",
    path: "/games/word-search",
    icon: Brain,
    status: "coming-soon",
    processing: "local",
  },
  {
    id: "2048",
    name: "2048",
    description: "A planned tile-merging number game",
    path: "/games/2048",
    icon: Dices,
    status: "coming-soon",
    processing: "local",
  },
];

export const availableGames = games.filter(isAvailable);
export const comingSoonGames = games.filter(isComingSoon);

export function getGameByPath(path: string): Game | undefined {
  return games.find((game) => game.path === path);
}
