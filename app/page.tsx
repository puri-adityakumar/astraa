import type { Metadata } from "next";
import { HeroSection } from "@/components/home";

export const metadata: Metadata = {
  title: "Free Online Utility Tools for Developers & Creators",
  description:
    "Astraa is a free utility toolkit with 15+ tools: scientific calculator, currency converter, password generator, hash generator, unit converter, markdown viewer, image resizer, and browser games. All processing happens locally in your browser.",
  openGraph: {
    title: "Astraa - Free Online Utility Tools",
    description:
      "15+ free browser-based utility tools for developers and creators.",
    url: "/",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astraa - Free Online Utility Tools",
    description: "15+ free browser-based tools. No signup required.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <HeroSection />
    </div>
  );
}
