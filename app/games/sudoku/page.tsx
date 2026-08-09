import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/sudoku")!;

export const metadata: Metadata = {
  title: "Sudoku",
  description: "A browser Sudoku puzzle is planned for Astraa but is not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Sudoku",
    description: "A planned browser Sudoku puzzle that is not playable yet.",
    url: "/games/sudoku",
  },
  alternates: { canonical: "/games/sudoku" },
};

export default function SudokuPage() {
  return <WorkInProgress name={game.name} kind="game" />;
}
