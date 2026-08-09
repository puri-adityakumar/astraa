import type { Metadata } from "next";

import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";
import { UnitConverterClient } from "@/components/units/unit-converter";

export const metadata: Metadata = {
  title: "Unit Converter",
  description:
    "Convert values across angle, length, mass, temperature, time, volume, and other measurement categories. Calculations run in your browser.",
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
  openGraph: {
    title: "Unit Converter",
    description: "Convert common metric, imperial, temperature, and data units in your browser.",
    url: "/tools/units",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Unit Converter",
    description: "Convert common metric, imperial, temperature, and data units in your browser.",
  },
  alternates: {
    canonical: "/tools/units",
  },
};

export default function UnitConverterPage() {
  return (
    <>
      <UnitConverterClient />
      <ToolGuide toolId="units" />
      <RelatedTools toolId="units" />
    </>
  );
}
