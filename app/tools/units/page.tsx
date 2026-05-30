import type { Metadata } from "next";
import { UnitConverterClient } from "@/components/units/unit-converter";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Unit Converter";
const TOOL_PATH = "/tools/units";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
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
  openGraph: {
    title: TOOL_NAME,
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Convert length, weight, temperature, and more. Free online unit conversion tool.",
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: `https://www.astraa.tech${TOOL_PATH}`,
  },
};

const softwareSchema = buildSoftwareApplicationSchema({
  name: TOOL_NAME,
  path: TOOL_PATH,
  description:
    "Convert length, weight, temperature, area, volume, and speed between metric and imperial units entirely in your browser.",
  applicationCategory: "UtilitiesApplication",
  featureList: [
    "Length conversion (mm, cm, m, km, in, ft, yd, mi)",
    "Weight / mass conversion",
    "Temperature (C, F, K)",
    "Area conversion",
    "Volume conversion",
    "Speed conversion",
    "Metric and imperial support",
    "Swap units in one click",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function UnitConverterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <UnitConverterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
