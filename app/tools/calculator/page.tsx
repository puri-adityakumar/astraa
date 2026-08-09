import type { Metadata } from "next";

import { CalculatorClient } from "@/components/calculator/calculator-client";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Scientific Calculator",
  description:
    "Calculate arithmetic, powers, trigonometric functions, logarithms, roots, and factorials in your browser. No account or install required.",
  keywords: [
    "scientific calculator",
    "online calculator",
    "math calculator",
    "trigonometry calculator",
    "logarithm calculator",
    "advanced calculator",
    "browser calculator",
  ],
  openGraph: {
    title: "Scientific Calculator",
    description: "Calculate arithmetic and scientific functions directly in your browser.",
    url: "/tools/calculator",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Scientific Calculator",
    description: "Calculate arithmetic and scientific functions directly in your browser.",
  },
  alternates: {
    canonical: "/tools/calculator",
  },
};

export default function CalculatorPage() {
  return (
    <>
      <CalculatorClient />
      <ToolGuide toolId="calculator" />
      <RelatedTools toolId="calculator" />
    </>
  );
}
