import type { Metadata } from "next";
import { SnakeClient } from "@/components/games/snake-client";

export const metadata: Metadata = {
  title: "Snake Game",
  description:
    "Play the classic Snake game online in your browser. Control the snake, eat food, grow longer, and beat your high score. Free, no download required.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Snake Game",
    description: "Play classic Snake online. Free browser game.",
    url: "/games/snake",
  },
  alternates: { canonical: "/games/snake" },
};

export default function SnakePage() {
  return <SnakeClient />;
}
