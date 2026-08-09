import type { Metadata } from "next";

import { GamesClient } from "@/components/games/games-client";
import { availableGames, comingSoonGames } from "@/lib/games";
import { areGamesIndexable } from "@/lib/seo/site";

const gamesAreIndexable = areGamesIndexable();
const availableGameLabel = `${availableGames.length} playable browser ${
  availableGames.length === 1 ? "game" : "games"
}`;
const plannedGameLabel = `${comingSoonGames.length} planned ${
  comingSoonGames.length === 1 ? "game" : "games"
}`;

export const metadata: Metadata = {
  title: "Browser Games",
  description: `Browse ${availableGameLabel} and ${plannedGameLabel} in Astraa's local games catalog.`,
  keywords: ["browser games", "online games", "local games", "memory game"],
  robots: { index: gamesAreIndexable, follow: true },
  openGraph: {
    title: "Browser Games",
    description: `Browse ${availableGameLabel} and ${plannedGameLabel}.`,
    url: "/games",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Browser Games",
    description: `Browse ${availableGameLabel} and ${plannedGameLabel}.`,
  },
  alternates: { canonical: "/games" },
};

export default function GamesPage() {
  return <GamesClient />;
}
