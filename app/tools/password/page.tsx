import type { Metadata } from "next";

import { PasswordGeneratorClient } from "@/components/password/password-generator";
import { RelatedTools } from "@/components/related-tools";
import { ToolGuide } from "@/components/tool-guide";

export const metadata: Metadata = {
  title: "Password Generator",
  description:
    "Create random passwords, multiword passphrases, or numeric PINs in your browser. Adjust length, numbers, symbols, and capitalization where supported.",
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
    title: "Password Generator",
    description: "Generate customizable random or memorable passwords locally in your browser.",
    url: "/tools/password",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Password Generator",
    description: "Generate customizable random or memorable passwords locally in your browser.",
  },
  alternates: {
    canonical: "/tools/password",
  },
};

export default function PasswordGeneratorPage() {
  return (
    <>
      <PasswordGeneratorClient />
      <ToolGuide toolId="password" />
      <RelatedTools toolId="password" />
    </>
  );
}
