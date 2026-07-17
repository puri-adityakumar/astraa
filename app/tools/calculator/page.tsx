import type { Metadata } from "next";
import { CalculatorClient } from "@/components/calculator/calculator-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Scientific Calculator",
  description:
    "Perform complex math calculations with our free Google-style scientific calculator. Supports trigonometry, logarithms, and advanced operations in your browser.",
  keywords: [
    "scientific calculator",
    "online calculator",
    "math calculator",
    "trigonometry calculator",
    "logarithm calculator",
    "advanced calculator",
    "free calculator",
    "browser calculator",
  ],
  path: "/tools/calculator",
  ogDescription:
    "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
});

export default function CalculatorPage() {
  return (
    <>
      <CalculatorClient />
      <LastUpdated />
    </>
  );
}
