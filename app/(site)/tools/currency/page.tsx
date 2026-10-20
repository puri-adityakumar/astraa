import type { Metadata } from "next";
import { currencyMetadata } from "@/lib/site-metadata";
import { CurrencyConverterClient } from "@/components/currency/currency-converter";

export const metadata: Metadata = currencyMetadata;

export default function CurrencyConverterPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <CurrencyConverterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
