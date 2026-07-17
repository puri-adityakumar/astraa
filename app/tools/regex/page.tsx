import type { Metadata } from "next";
import { RegexTesterClient } from "@/components/regex-tester/regex-tester-client";
import { LastUpdated } from "@/components/last-updated";
import { createToolMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createToolMetadata({
  title: "Regex Tester",
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
  path: "/tools/regex",
  ogDescription:
    "Live JavaScript regex playground with capture-group highlights, replace mode, and shareable URLs.",
});

export default function RegexTesterPage() {
  return (
    <>
      <RegexTesterClient />
      <LastUpdated />
    </>
  );
}
