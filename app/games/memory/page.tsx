import type { Metadata } from "next";

import { MemoryClient } from "@/components/games/memory-client";

const E2E_FIXED_DECK_ORDER = [
  "circle-a",
  "diamond-a",
  "circle-b",
  "diamond-b",
  "hexagon-a",
  "hexagon-b",
  "pentagon-a",
  "pentagon-b",
  "sparkle-a",
  "sparkle-b",
  "square-a",
  "square-b",
  "star-a",
  "star-b",
  "triangle-a",
  "triangle-b",
] as const;

export const metadata: Metadata = {
  title: "Memory Game",
  description:
    "Play a 4 by 4 card-matching memory game with eight symbol pairs. It runs locally in your browser without an account or saved score.",
  keywords: ["memory game", "card matching game", "browser game", "accessible game"],
  openGraph: {
    title: "Memory Game",
    description: "Match eight symbol pairs in a local, keyboard-accessible browser game.",
    url: "/games/memory",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Memory Game",
    description: "Match eight symbol pairs in a local, keyboard-accessible browser game.",
  },
  alternates: { canonical: "/games/memory" },
};

export default function MemoryPage() {
  const fixedDeckOrder =
    process.env.ASTRAA_E2E_FIXTURES === "true" ? E2E_FIXED_DECK_ORDER : undefined;

  return <MemoryClient {...(fixedDeckOrder ? { fixedDeckOrder } : {})} />;
}
