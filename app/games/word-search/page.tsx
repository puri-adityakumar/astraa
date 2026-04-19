import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";

export const metadata: Metadata = {
  title: "Word Search",
  description:
    "Find hidden words in letter grids. Search horizontally, vertically, and diagonally to discover all words. Free online word search puzzle game.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Word Search",
    description: "Find hidden words in letter grids.",
    url: "/games/word-search",
  },
  alternates: { canonical: "/games/word-search" },
};

export default function WordSearchPage() {
  return <WorkInProgress />;
}
