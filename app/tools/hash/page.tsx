import type { Metadata } from "next";
import { HashGeneratorClient } from "@/components/hash/hash-generator";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Hash Generator";
const TOOL_PATH = "/tools/hash";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
  description:
    "Generate secure hash outputs including MD5, SHA-1, SHA-256, and SHA-512. Free online hashing tool for developers with instant client-side processing.",
  keywords: [
    "hash generator",
    "MD5 hash",
    "SHA-256 hash",
    "SHA-512 hash",
    "SHA-1 hash",
    "online hash tool",
    "checksum generator",
    "hash calculator",
  ],
  openGraph: {
    title: TOOL_NAME,
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes instantly in your browser.",
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
    "Compute cryptographic hashes of any text or file entirely in your browser using the Web Crypto API.",
  applicationCategory: "SecurityApplication",
  featureList: [
    "MD5 hash",
    "SHA-1 hash",
    "SHA-256 hash",
    "SHA-512 hash",
    "Text and file input",
    "Copy hash to clipboard",
    "Client-side only via Web Crypto API",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function HashGeneratorPage() {
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
      <HashGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
