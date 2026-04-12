import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";

export const metadata: Metadata = {
  title: "Sudoku",
  description:
    "Solve Sudoku puzzles online with multiple difficulty levels. Fill the 9x9 grid using logic and number placement. Free browser-based Sudoku game.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Sudoku",
    description: "Solve Sudoku puzzles online.",
    url: "/games/sudoku",
  },
  alternates: { canonical: "/games/sudoku" },
};

export default function SudokuPage() {
  return <WorkInProgress />;
}
