import type { Metadata } from "next";
import { homeMetadata } from "@/lib/site-metadata";
import { HeroSection } from "@/components/home";

export const metadata: Metadata = homeMetadata;

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <HeroSection />
    </div>
  );
}
