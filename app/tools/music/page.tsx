import type { Metadata } from "next";
import { LofiStudioClient } from "@/components/music/lofi-studio-client";

export const metadata: Metadata = {
  title: "Lofi Focus Studio",
  description:
    "Stay productive with lofi beats, a built-in pomodoro timer, and task management. Free browser-based focus tool to boost concentration and workflow.",
  keywords: [
    "lofi music",
    "focus music",
    "pomodoro timer",
    "productivity tool",
    "study music",
    "lofi beats",
    "task manager",
    "focus studio",
  ],
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Lofi Focus Studio",
    description:
      "Lofi beats, pomodoro timer, and task management in one free productivity tool.",
    url: "/tools/music",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Lofi Focus Studio",
    description:
      "Lofi beats, pomodoro timer, and task management in one free productivity tool.",
  },
  alternates: {
    canonical: "/tools/music",
  },
};

export default function LofiPage() {
  return <LofiStudioClient />;
}
