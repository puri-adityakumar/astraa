import type { Metadata } from "next";
import { unitsMetadata } from "@/lib/site-metadata";
import { UnitConverterClient } from "@/components/units/unit-converter";

export const metadata: Metadata = unitsMetadata;

export default function UnitConverterPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <UnitConverterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
