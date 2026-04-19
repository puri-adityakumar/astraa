import type { Metadata } from "next";
import { CalculatorClient } from "@/components/calculator/calculator-client";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Scientific Calculator",
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
    url: "/tools/calculator",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Scientific Calculator",
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
  },
  alternates: {
    canonical: "/tools/calculator",
  },
};

export default function CalculatorPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <CalculatorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
