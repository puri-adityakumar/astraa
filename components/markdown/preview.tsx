"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMarkdownEditor } from "@/lib/stores/markdown-editor";

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
      aria-live="polite"
      aria-label="Markdown preview"
    >
      {content.trim() === "" ? (
        <p className="text-muted-foreground">Preview will appear here as you type.</p>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{debounced}</ReactMarkdown>
      )}
    </div>
  );
}
