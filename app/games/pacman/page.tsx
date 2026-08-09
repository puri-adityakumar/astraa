import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getGameByPath } from "@/lib/games";

const game = getGameByPath("/games/pacman")!;

export const metadata: Metadata = {
  title: "Pacman",
  description: "An arcade-style browser maze game is planned for Astraa but is not playable yet.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Pacman",
    description: "A planned browser maze game that is not playable yet.",
    url: "/games/pacman",
  },
  alternates: { canonical: "/games/pacman" },
};

export default function PacmanPage() {
  return <WorkInProgress name={game.name} kind="game" />;
}
