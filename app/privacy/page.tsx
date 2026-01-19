import ReactMarkdown from "react-markdown";
import fs from "fs";
import path from "path";

export default function PrivacyPolicy() {
  // Read the markdown file
  const filePath = path.join(process.cwd(), "app/privacy/privacy-policy.md");
  const content = fs.readFileSync(filePath, "utf8");

  return (
    <div className="mx-auto w-full max-w-4xl">
      <main className="container px-4 pb-8 pt-28 sm:pt-32 md:pb-12">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-background/0 via-background/80 to-background p-6 backdrop-blur-sm md:p-8">
          <article className="prose max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-p:text-foreground prose-a:text-primary prose-strong:text-foreground prose-li:text-foreground sm:prose-h1:text-4xl sm:prose-h2:text-2xl">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
