"use client";

import { useEffect, useState, type ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";
import type { Pluggable } from "unified";
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

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;
const getMermaid = () => {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      m.default.initialize({ startOnLoad: false, securityLevel: "strict" });
      return m.default;
    });
  }
  return mermaidPromise;
};

function MermaidBlock({ source }: { source: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMermaid()
      .then((mermaid) =>
        mermaid.render(`m-${Math.random().toString(36).slice(2)}`, source),
      )
      .then((res) => {
        if (!cancelled) {
          setSvg(res.svg);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Mermaid parse error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [source]);

  if (error) {
    return (
      <pre className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs">
        Mermaid error: {error}
      </pre>
    );
  }
  if (!svg) return <pre className="rounded-md bg-muted p-3 text-xs">Rendering diagram…</pre>;
  return <div className="my-3 overflow-auto" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function CodeBlock({ className, children }: ComponentProps<"code">) {
  const { resolvedTheme } = useTheme();
  const [html, setHtml] = useState<string | null>(null);
  const code = String(children ?? "");
  const match = className?.match(/language-(\w+)/);
  const lang = (match?.[1] ?? "text").toLowerCase();
  const inline = !match && !code.includes("\n");

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

  if (!inline && lang === "mermaid") {
    return <MermaidBlock source={code} />;
  }

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

  const hasMath = /\$[^$\n]+\$|\$\$[\s\S]+?\$\$/.test(debounced);
  const [mathPlugins, setMathPlugins] = useState<{ remark: Pluggable; rehype: Pluggable } | null>(
    null,
  );

  useEffect(() => {
    if (!hasMath || mathPlugins) return;
    Promise.all([
      import("remark-math"),
      import("rehype-katex"),
      // @ts-expect-error CSS module has no type declarations
      import("katex/dist/katex.min.css"),
    ])
      .then(([rm, rk]) => {
        setMathPlugins({ remark: rm.default, rehype: rk.default });
      })
      .catch(() => {
        // leave raw — toast handled in a later task
      });
  }, [hasMath, mathPlugins]);

  return (
    <div
      className="markdown-preview prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto h-full"
      aria-label="Markdown preview"
    >
      {content.trim() === "" ? (
        <p className="text-muted-foreground">Preview will appear here as you type.</p>
      ) : (
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            ...(hasMath && mathPlugins ? [mathPlugins.remark] : []),
          ]}
          rehypePlugins={hasMath && mathPlugins ? [mathPlugins.rehype] : []}
          components={{ code: CodeBlock }}
        >
          {debounced || content}
        </ReactMarkdown>
      )}
    </div>
  );
}
