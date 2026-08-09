import type { Metadata } from "next";
import { WorkInProgress } from "@/components/wip";
import { getToolById } from "@/lib/tools";

const musicTool = getToolById("music")!;

export const metadata: Metadata = {
  title: "Lofi Focus Studio",
  description:
    "Lofi Focus Studio is planned for Astraa. The proposed streaming audio, timer, and task features are not available yet.",
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
      "A planned focus workspace; streaming audio and productivity features are not live.",
    url: "/tools/music",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Lofi Focus Studio",
    description:
      "A planned focus workspace; streaming audio and productivity features are not live.",
  },
  alternates: {
    canonical: "/tools/music",
  },
};

export default function LofiPage() {
  return <WorkInProgress name={musicTool.name} kind="tool" />;
}
