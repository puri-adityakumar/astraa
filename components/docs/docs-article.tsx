import { isValidElement, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { MermaidDiagram } from "@/components/docs/mermaid-diagram";
import { createDiagramId, createHeadingSlugger, type HeadingSlugger } from "@/lib/docs/headings";
import { resolveDocsLink } from "@/lib/docs/catalog";

interface DocsArticleProps {
  markdown: string;
  sourceKey: string;
}

export function DocsArticle({ markdown, sourceKey }: DocsArticleProps) {
  const headingSlugger = createHeadingSlugger();
  const diagramOccurrences = new Map<string, number>();
  const components: Components = {
    a: ({ children, href = "" }) => {
      const resolved = resolveDocsLink(href, sourceKey);
      if (!resolved.href || resolved.kind === "rejected") {
        return (
          <span className="text-muted-foreground" data-doc-link-rejected="true">
            {children}
          </span>
        );
      }

      if (resolved.kind === "external") {
        return (
          <a href={resolved.href} target="_blank" rel="noopener noreferrer">
            {children}
            <span aria-hidden="true"> ↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      }

      return <Link href={resolved.href}>{children}</Link>;
    },
    code: ({ children, className }) => <code className={className}>{children}</code>,
    h1: createHeadingComponent("h1", headingSlugger),
    h2: createHeadingComponent("h2", headingSlugger),
    h3: createHeadingComponent("h3", headingSlugger),
    h4: createHeadingComponent("h4", headingSlugger),
    h5: createHeadingComponent("h5", headingSlugger),
    h6: createHeadingComponent("h6", headingSlugger),
    pre: ({ children }) => {
      if (
        isValidElement<{ children?: ReactNode; className?: string }>(children) &&
        children.props.className === "language-mermaid"
      ) {
        const source = textContent(children.props.children).replace(/\n$/, "");
        const occurrence = diagramOccurrences.get(source) ?? 0;
        diagramOccurrences.set(source, occurrence + 1);
        return <MermaidDiagram diagramId={createDiagramId(source, occurrence)} source={source} />;
      }

      return (
        <pre
          className="not-prose my-6 max-w-full overflow-x-auto rounded-lg border bg-muted/50 p-4 text-sm"
          tabIndex={0}
          aria-label="Code block"
        >
          {children}
        </pre>
      );
    },
    table: ({ children }) => (
      <div
        className="not-prose my-6 max-w-full overflow-x-auto rounded-lg border"
        tabIndex={0}
        aria-label="Scrollable table"
      >
        <table className="w-full min-w-max border-collapse text-left text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b bg-muted px-4 py-3 font-medium text-foreground">{children}</th>
    ),
    td: ({ children }) => <td className="border-b px-4 py-3 align-top">{children}</td>,
  };

  return (
    <article
      className={
        "prose max-w-none break-words text-foreground dark:prose-invert " +
        "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-h1:text-4xl " +
        "prose-h1:leading-tight prose-h2:mt-12 prose-h2:text-3xl prose-h3:mt-8 " +
        "prose-a:font-medium prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 " +
        "prose-code:break-words prose-code:text-foreground prose-p:text-foreground " +
        "prose-li:text-foreground prose-strong:text-foreground sm:prose-h1:text-5xl"
      }
      data-doc-source-key={sourceKey}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
        skipHtml
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
}

type HeadingName = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

function createHeadingComponent(headingName: HeadingName, slugger: HeadingSlugger) {
  const Heading = headingName;
  return function DocsHeading({ children }: ComponentProps<HeadingName>) {
    const id = slugger.slug(textContent(children));
    return (
      <Heading id={id}>
        {children}
        <a
          href={`#${id}`}
          className="not-prose ml-1 inline-flex min-h-touch min-w-touch items-center justify-center rounded-md align-middle no-underline opacity-60 transition-colors hover:bg-muted/60 hover:opacity-100 focus:opacity-100"
          aria-label={`Link to ${textContent(children)}`}
        >
          <span aria-hidden="true">#</span>
        </a>
      </Heading>
    );
  };
}

function textContent(value: ReactNode): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textContent).join("");
  if (isValidElement<{ children?: ReactNode }>(value)) return textContent(value.props.children);
  return "";
}
