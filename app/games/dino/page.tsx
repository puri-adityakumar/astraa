import type { Metadata } from "next";
import { DinoClient } from "@/components/games/dino-client";

export const metadata: Metadata = {
  title: "Chrome Dino Game",
  description:
    "Play the Chrome Dinosaur runner game online. Jump over cacti and dodge obstacles to beat your high score. Inspired by the classic Chrome offline game.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Chrome Dino Game",
    description: "Play the dinosaur runner game online.",
    url: "/games/dino",
  },
  alternates: { canonical: "/games/dino" },
};

export default function DinoPage() {
  return <DinoClient />;
}
