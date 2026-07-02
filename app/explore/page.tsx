import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/explore-client";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Explore",
  description:
    "Discover all tools and games available on Astraa. Browse by category, find the right tool for your task, and explore our growing collection of free utilities.",
  path: "/explore",
  ogDescription: "Discover all tools and games on Astraa.",
  twitterTitle: "Explore Astraa",
  twitterDescription: "Discover all tools and games.",
});

export default function ExplorePage() {
  return <ExploreClient />;
}
