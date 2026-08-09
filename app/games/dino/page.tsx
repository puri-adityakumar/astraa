import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/dino")!;

export const metadata: Metadata = {
  title: "Dino Jump",
  description: "A browser dinosaur runner is planned for Astraa but is not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Dino Jump",
    description: "A planned browser dinosaur runner that is not playable yet.",
    url: "/games/dino",
  },
  alternates: { canonical: "/games/dino" },
};

export default function DinoPage() {
  return <WorkInProgress name={game.name} kind="game" />;
}
