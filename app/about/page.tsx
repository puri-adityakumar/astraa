import type { Metadata } from "next";
import { AboutClient } from "@/components/about/about-client";

export const metadata: Metadata = {
  title: "About | astraa",
  description:
    "astraa is a fast, local-first collection of browser utilities. No servers, no sign-ups, no accounts — privacy is the foundation.",
  keywords: ["about astraa", "local tools", "privacy", "open source toolkit"],
  openGraph: {
    title: "About | astraa",
    description: "Built for speed, privacy, and craft.",
    url: "/about",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "About | astraa",
    description: "Built for speed, privacy, and craft.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
