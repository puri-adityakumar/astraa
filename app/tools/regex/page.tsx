import type { Metadata } from "next";
import { RegexTesterClient } from "@/components/regex-tester/regex-tester-client";

export const metadata: Metadata = {
  title: "Regex Tester | astraa",
  description:
    "Test and validate JavaScript regular expressions live in your browser. Capture-group highlights, replace mode, starter library, click-to-insert cheatsheet, and shareable URLs.",
  keywords: [
    "regex tester",
    "regular expression",
    "regex validator",
    "javascript regex",
    "regex playground",
    "regex cheatsheet",
    "online regex tool",
    "regex builder",
  ],
  openGraph: {
    title: "Regex Tester | astraa",
    description:
      "Live JavaScript regex playground with capture-group highlights, replace mode, and shareable URLs.",
    url: "/tools/regex",
    images: ["/assets/astraa_banner.jpg"],
  },
  twitter: {
    card: "summary",
    title: "Regex Tester | astraa",
    description:
      "Live JavaScript regex playground with capture-group highlights, replace mode, and shareable URLs.",
  },
  alternates: {
    canonical: "/tools/regex",
  },
};

export default function RegexTesterPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <RegexTesterClient />
      <p className="text-xs text-muted-foreground text-center mt-4">
        Last updated: {lastUpdated}
      </p>
    </>
  );
}
