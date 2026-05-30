import type { Metadata } from "next";
import { CalculatorClient } from "@/components/calculator/calculator-client";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Scientific Calculator";
const TOOL_PATH = "/tools/calculator";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
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
    title: TOOL_NAME,
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Free online scientific calculator with trigonometry, logarithms, and advanced math operations.",
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
    "Google-style scientific calculator supporting trigonometry, logarithms, exponentiation, and parentheses entirely in your browser.",
  applicationCategory: "EducationalApplication",
  featureList: [
    "Basic arithmetic",
    "Trigonometric functions (sin, cos, tan)",
    "Inverse trig functions",
    "Logarithms (log, ln)",
    "Exponentiation and powers",
    "Parentheses and operator precedence",
    "Constants (pi, e)",
    "Degree and radian modes",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function CalculatorPage() {
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
      <CalculatorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
