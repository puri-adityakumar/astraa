import { Gamepad2, Brain } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type Game = {
  name: string
  description: string
  path: string
  icon: LucideIcon
  comingSoon?: boolean
}

export const games: Game[] = [
  // Arcade Games
  {
    name: "Snake",
    description: "Classic snake game",
    path: "/games/snake",
    icon: Gamepad2,
    comingSoon: true
  },
  {
    name: "Dino Jump",
    description: "Chrome's famous dinosaur game",
    path: "/games/dino",
    icon: Gamepad2,
    comingSoon: true
  },
  {
    name: "Pacman",
    description: "Classic arcade maze game",
    path: "/games/pacman",
    icon: Gamepad2,
    comingSoon: true
  },

  // Puzzle Games
  {
    name: "Memory Game",
    description: "Test your memory with card matching",
    path: "/games/memory",
    icon: Brain,
    comingSoon: true
  },
  {
    name: "Sudoku",
    description: "Classic number placement puzzle",
    path: "/games/sudoku",
    icon: Brain,
    comingSoon: true
  },
  {
    name: "Word Search",
    description: "Find hidden words in a grid",
    path: "/games/word-search",
    icon: Brain,
    comingSoon: true
  }
]

/** Registry entries that are playable today, in registry order. */
export function availableGames(list: readonly Game[] = games): Game[] {
  return list.filter((game) => !game.comingSoon);
}