import type { Metadata } from "next";
import { MemoryClient } from "@/components/games/memory-client";

export const metadata: Metadata = {
  title: "Memory Game",
  description:
    "Test your memory by matching pairs of cards. Flip cards, find matches, and challenge yourself to beat the clock. Free browser-based memory game.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Memory Game",
    description: "Match card pairs and test your memory online.",
    url: "/games/memory",
  },
  alternates: { canonical: "/games/memory" },
};

export default function MemoryPage() {
  return <MemoryClient />;
}
