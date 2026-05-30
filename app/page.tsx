import type { Metadata } from "next";
import { HeroSection } from "@/components/home";
import { ToolGrid } from "@/components/home/tool-grid";
import { toolCategories } from "@/lib/tools";

const LIVE_TOOL_COUNT = toolCategories
  .flatMap((c) => c.items)
  .filter((t) => !t.comingSoon).length;

export const metadata: Metadata = {
  title: "Free Browser Tools for Developers & Creators",
  description: `Astraa is a free toolkit of ${LIVE_TOOL_COUNT} browser-based utilities: scientific calculator, currency converter, password generator, hash generator, unit converter, markdown editor, image resizer, and AI text generator. All processing happens locally in your browser.`,
  openGraph: {
    title: `Astraa - ${LIVE_TOOL_COUNT}+ Free Browser Tools`,
    description: `${LIVE_TOOL_COUNT} free browser-based utility tools for developers and creators.`,
    url: "/",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `Astraa - ${LIVE_TOOL_COUNT}+ Free Browser Tools`,
    description: `${LIVE_TOOL_COUNT} free browser-based tools. No signup required.`,
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <HeroSection />
      <ToolGrid />
    </div>
  );
}
