import type { Metadata } from "next";
import { UnitConverterClient } from "@/components/units/unit-converter";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Unit Converter",
  description:
    "Convert between different units of measurement including length, weight, temperature, and more. Free online unit conversion tool with metric and imperial support.",
  keywords: [
    "unit converter",
    "measurement converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "metric converter",
    "imperial converter",
    "conversion tool",
    "unit conversion calculator",
    "measurement tool",
  ],
  path: "/tools/units",
  ogDescription: "Convert length, weight, temperature, and more. Free online unit conversion tool.",
});

export default function UnitConverterPage() {
  return (
    <>
      <UnitConverterClient />
      <LastUpdated />
    </>
  );
}
