import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Astraa handles local tool data, provider-backed features, diagnostics, analytics, and browser storage.",
  openGraph: {
    title: "Privacy Policy",
    description: "Astraa's privacy policy and data handling practices.",
    url: "/privacy",
  },
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicy() {
  // Read the markdown file
  const filePath = path.join(process.cwd(), "app/privacy/privacy-policy.md");
  const content = fs.readFileSync(filePath, "utf8");

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      <article className="prose max-w-none rounded-xl border bg-card p-6 shadow-geist prose-headings:font-semibold prose-a:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground dark:prose-invert sm:p-8 md:p-10">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
