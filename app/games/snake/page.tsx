import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/snake")!;

export const metadata: Metadata = {
  title: "Snake",
  description: "A browser version of the classic Snake game is planned but not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Snake",
    description: "A planned browser Snake game that is not playable yet.",
    url: "/games/snake",
  },
  alternates: { canonical: "/games/snake" },
};

export default function SnakePage() {
  return <WorkInProgress name={game.name} kind="game" />;
}
