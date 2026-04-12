import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/explore-client";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Discover all tools and games available on Astraa. Browse by category, find the right tool for your task, and explore our growing collection of free utilities.",
  openGraph: {
    title: "Explore",
    description: "Discover all tools and games on Astraa.",
    url: "/explore",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Explore Astraa",
    description: "Discover all tools and games.",
  },
  alternates: { canonical: "/explore" },
};

export default function ExplorePage() {
  return <ExploreClient />;
}
