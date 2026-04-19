import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Astraa's privacy policy. Learn how we handle your data. All tool processing happens locally in your browser with no data transmitted to servers.",
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
    <div className="w-full max-w-4xl mx-auto">
      <main className="container px-4 pt-28 sm:pt-32 pb-8 md:pb-12">
        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-b from-background/0 via-background/80 to-background border border-border/50 backdrop-blur-sm">
          <article className="prose prose-headings:font-bold prose-h1:text-3xl sm:prose-h1:text-4xl prose-h2:text-xl sm:prose-h2:text-2xl prose-a:text-primary prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
