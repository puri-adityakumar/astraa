import type { Metadata } from "next";
import { calculatorMetadata } from "@/lib/site-metadata";
import { CalculatorClient } from "@/components/calculator/calculator-client";

export const metadata: Metadata = calculatorMetadata;

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
