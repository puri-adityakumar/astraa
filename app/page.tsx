import type { Metadata } from "next";

import { CatalogProof } from "@/components/home/catalog-proof";
import { HeroSection } from "@/components/home/hero-section";
import { FinalToolsAction, OpenSourceSection } from "@/components/home/open-source-section";
import { PopularTools } from "@/components/home/popular-tools";
import { ToolWorkflow } from "@/components/home/tool-workflow";
import { SITE_NAME } from "@/lib/seo/site";
import { availableTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: `Free Online Tools for Developers and Creators | ${SITE_NAME}`,
  description:
    `Use ${availableTools.length} browser-first tools for JSON, images, writing, calculations, ` +
    "and conversions, with provider-backed boundaries labelled before use.",
  openGraph: {
    title: "Astraa browser-first utility tools",
    description:
      `${availableTools.length} focused tools for developer and creator work, with clear ` +
      "processing boundaries.",
    url: "/",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astraa browser-first utility tools",
    description: `${availableTools.length} focused tools with no account or installation required.`,
  },
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <ToolWorkflow />
      <PopularTools />
      <CatalogProof />
      <OpenSourceSection />
      <FinalToolsAction />
    </>
  );
}
