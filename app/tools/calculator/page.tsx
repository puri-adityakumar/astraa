import { Metadata } from "next";
import { CalculatorClient } from "@/components/calculator/calculator-client";

export const metadata: Metadata = {
  title: "Scientific Calculator | astraa",
  description:
    "Perform complex math calculations with our Google-style scientific calculator.",
  openGraph: {
    title: "Scientific Calculator",
    description:
      "Perform complex math calculations with our Google-style scientific calculator.",
  },
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
