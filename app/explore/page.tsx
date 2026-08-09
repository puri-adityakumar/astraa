import type { Metadata } from "next";

import { ExploreClient } from "@/components/explore/explore-client";
import { availableGames, comingSoonGames } from "@/lib/games";
import { availableTools, comingSoonTools } from "@/lib/tools";

const availableGameLabel = `${availableGames.length} available ${
  availableGames.length === 1 ? "game" : "games"
}`;
const plannedGameLabel = `${comingSoonGames.length} planned ${
  comingSoonGames.length === 1 ? "game" : "games"
}`;

export const metadata: Metadata = {
  title: "Explore",
  description:
    `Browse ${availableTools.length} available utilities, ${comingSoonTools.length} planned ` +
    `tools, ${availableGameLabel}, and ${plannedGameLabel} in the Astraa catalog.`,
  openGraph: {
    title: "Explore",
    description:
      `Browse ${availableTools.length} available tools, ${availableGameLabel}, and clearly ` +
      `labelled previews.`,
    url: "/explore",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Explore Astraa",
    description:
      `Browse ${availableTools.length} available tools, ${availableGameLabel}, and planned ` +
      `additions.`,
  },
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return <ExploreClient />;
}
