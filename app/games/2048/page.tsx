import type { Metadata } from "next";

import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/2048")!;

export const metadata: Metadata = {
  title: "2048",
  description: "A browser tile-merging number game is planned but is not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "2048",
    description: "A planned browser tile-merging game that is not playable yet.",
    url: "/games/2048",
  },
  alternates: { canonical: "/games/2048" },
};

export default function Game2048Page() {
  return <WorkInProgress name={game.name} kind="game" />;
}
