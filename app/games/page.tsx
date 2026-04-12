import type { Metadata } from "next";
import { GamesClient } from "@/components/games/games-client";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Play free browser games on Astraa. Coming soon: Snake, Memory, Chrome Dino, Sudoku, Word Search, and Pac-Man. No downloads, no signup required.",
  keywords: ["browser games", "online games", "free games"],
  openGraph: {
    title: "Games",
    description: "Free browser games on Astraa.",
    url: "/games",
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary",
    title: "Games",
    description: "Free browser games. No downloads required.",
  },
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return <GamesClient />;
}
