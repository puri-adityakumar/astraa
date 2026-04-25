"use client";

import { useEffect, useState, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

const PRELOADED_LANGS = ["javascript", "typescript", "python", "bash", "json", "markdown"];

let highlighterPromise: Promise<{
  codeToHtml: (code: string, opts: { lang: string; theme: string }) => Promise<string>;
}> | null = null;

const getHighlighter = async () => {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(async (shiki) => {
      const hl = await shiki.createHighlighter({
        themes: ["github-dark", "github-light"],
        langs: PRELOADED_LANGS,
      });
      return {
        codeToHtml: async (code, opts) => hl.codeToHtml(code, opts),
      };
    });
  }
  return highlighterPromise;
};

function CodeBlock({ className, children }: ComponentProps<"code">) {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState<string | null>(null);
  const code = String(children ?? "");
  const lang = (className?.match(/language-(\w+)/)?.[1] ?? "text").toLowerCase();
  const inline = !className;

  useEffect(() => {
    if (inline) return;
    let cancelled = false;
    getHighlighter()
      .then((hl) =>
        hl.codeToHtml(code, {
          lang: PRELOADED_LANGS.includes(lang) ? lang : "text",
          theme: resolvedTheme === "dark" ? "github-dark" : "github-light",
        }),
      )
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang, resolvedTheme, inline]);

  if (inline) {
    return <code className="rounded bg-muted px-1 py-0.5">{children}</code>;
  }
  if (html) {
    return (
      <div className="rounded-md overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  return (
    <pre className="rounded-md bg-muted p-3 text-sm overflow-x-auto">
      <code>{code}</code>
    </pre>
  );
}

export function Preview() {
  const content = useMarkdownEditor((s) =>
    s.files.find((f) => f.id === s.currentFileId)?.content ?? "",
  );
  const [debounced, setDebounced] = useState(content);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(content), 1000);
    return () => window.clearTimeout(t);
  }, [content]);

  return (
    <div
      className="markdown-preview prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto h-full"
      aria-label="Markdown preview"
    >
      {content.trim() === "" ? (
        <p className="text-muted-foreground">Preview will appear here as you type.</p>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
          {debounced || content}
        </ReactMarkdown>
      )}
    </div>
  );
}
