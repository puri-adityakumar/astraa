import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/word-search")!;

export const metadata: Metadata = {
  title: "Word Search",
  description: "A browser word-search puzzle is planned for Astraa but is not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Word Search",
    description: "A planned word-search puzzle that is not playable yet.",
    url: "/games/word-search",
  },
  alternates: { canonical: "/games/word-search" },
};

export default function WordSearchPage() {
  return <WorkInProgress name={game.name} kind="game" />;
}
