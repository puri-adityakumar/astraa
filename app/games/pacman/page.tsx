import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";

export const metadata: Metadata = {
  title: "Pac-Man",
  description:
    "Play Pac-Man online in your browser. Navigate mazes, eat pellets, avoid ghosts, and chase high scores. Classic arcade gameplay, free and no download.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Pac-Man",
    description: "Play Pac-Man arcade game online.",
    url: "/games/pacman",
  },
  alternates: { canonical: "/games/pacman" },
};

export default function PacmanPage() {
  return <WorkInProgress />;
}
