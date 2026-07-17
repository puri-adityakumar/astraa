import type { Metadata } from "next";
import { GamesClient } from "@/components/games/games-client";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Games",
  description:
    "Play free browser games on Astraa. Coming soon: Snake, Memory, Chrome Dino, Sudoku, Word Search, and Pac-Man. No downloads, no signup required.",
  keywords: ["browser games", "online games", "free games"],
  path: "/games",
  ogDescription: "Free browser games on Astraa.",
  twitterDescription: "Free browser games. No downloads required.",
});

export default function GamesPage() {
  return <GamesClient />;
}
