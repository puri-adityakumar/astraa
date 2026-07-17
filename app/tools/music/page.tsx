import type { Metadata } from "next";
import { LofiStudioClient } from "@/components/music/lofi-studio-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
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
  path: "/tools/music",
  ogDescription: "Lofi beats, pomodoro timer, and task management in one free productivity tool.",
  robots: {
    index: false,
    follow: true,
  },
});

export default function LofiPage() {
  return (
    <>
      <LofiStudioClient />
      <LastUpdated />
    </>
  );
}
