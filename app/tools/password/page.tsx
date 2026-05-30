import type { Metadata } from "next";
import { PasswordGeneratorClient } from "@/components/password/password-generator";
import {
  buildSoftwareApplicationSchema,
  buildToolBreadcrumbSchema,
  formatLastModified,
} from "@/lib/tool-schema";

const TOOL_NAME = "Password Generator";
const TOOL_PATH = "/tools/password";
const LAST_MODIFIED = "2026-05-30";

export const metadata: Metadata = {
  title: TOOL_NAME,
  description:
    "Create strong, secure passwords with customizable length and character options. Generate random passwords with uppercase, lowercase, numbers, and symbols instantly.",
  keywords: [
    "password generator",
    "strong password",
    "random password",
    "secure password",
    "password creator",
    "online password generator",
    "custom password",
    "password tool",
  ],
  openGraph: {
    title: TOOL_NAME,
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
    url: TOOL_PATH,
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: TOOL_NAME,
    description:
      "Generate strong, secure passwords with customizable options. Free and private.",
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
    "Generate cryptographically random passwords, memorable passphrases, or numeric PINs entirely in your browser using the Web Crypto API.",
  applicationCategory: "SecurityApplication",
  featureList: [
    "Customizable length (6-64 characters)",
    "Uppercase, lowercase, numbers, and symbol toggles",
    "Memorable passphrase mode",
    "Numeric PIN mode",
    "Entropy / strength indicator",
    "Client-side only — no server transmission",
  ],
  lastModified: LAST_MODIFIED,
});
const breadcrumbSchema = buildToolBreadcrumbSchema(TOOL_NAME, TOOL_PATH);

export default function PasswordGeneratorPage() {
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
      <PasswordGeneratorClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {formatLastModified(LAST_MODIFIED)}
      </p>
    </>
  );
}
