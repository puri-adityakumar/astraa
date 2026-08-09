import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { resolveDocsLink } from "@/lib/docs/catalog";

import { DocsArticle } from "./docs-article";

describe("DocsArticle", () => {
  it("renders stable unique heading IDs and allowlisted links", () => {
    const html = renderToStaticMarkup(
      createElement(DocsArticle, {
        sourceKey: "overview",
        markdown:
          "# Safe heading\n\n" +
          "## Repeat\n\n## Repeat\n\n" +
          "[Architecture](./ARCHITECTURE.md)\n\n" +
          "[Repository](https://github.com/puri-adityakumar/astraa)",
      }),
    );

    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(html).toContain('<h1 id="safe-heading">');
    expect(html).toContain('<h2 id="repeat">');
    expect(html).toContain('<h2 id="repeat-1">');
    expect(html).toContain('href="/docs/architecture"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("rejects raw HTML, unsafe URLs, and unknown relative Markdown sources", () => {
    const html = renderToStaticMarkup(
      createElement(DocsArticle, {
        sourceKey: "overview",
        markdown:
          "# Safe\n\n<script>alert('unsafe')</script>\n\n" +
          "[Unsafe](javascript:alert(1))\n\n[Unknown](../CONTRIBUTING.md)",
      }),
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("CONTRIBUTING.md");
    expect(html.match(/data-doc-link-rejected="true"/g)).toHaveLength(2);
  });

  it("server-renders complete Mermaid source before optional enhancement", () => {
    const html = renderToStaticMarkup(
      createElement(DocsArticle, {
        sourceKey: "architecture",
        markdown: "# Diagram\n\n```mermaid\nflowchart LR\n  Page --> Client\n```",
      }),
    );

    expect(html).toContain('data-mermaid-source="true"');
    expect(html).toContain("flowchart LR");
    expect(html).toContain("Diagram renderer not loaded.");
    expect(html).not.toContain('data-mermaid-rendered="true"');
  });

  it("rewrites a real API fragment to an ID emitted by the renderer", () => {
    const markdown = readFileSync(resolve(process.cwd(), "docs/API.md"), "utf8");
    const target = resolveDocsLink("./API.md#generatetext-server-action", "overview");
    const html = renderToStaticMarkup(
      createElement(DocsArticle, { sourceKey: "serverInterfaces", markdown }),
    );

    expect(target).toEqual({
      href: "/docs/server-interfaces#generatetext-server-action",
      kind: "internal",
    });
    expect(html).toContain('<h2 id="generatetext-server-action">');
    expect(html).toContain('id="server-interfaces"');
  });

  it("renders the canonical documentation boundary with a stable heading ID", () => {
    const markdown = readFileSync(resolve(process.cwd(), "docs/ARCHITECTURE.md"), "utf8");
    const html = renderToStaticMarkup(
      createElement(DocsArticle, { sourceKey: "architecture", markdown }),
    );

    expect(html).toContain('<h2 id="documentation-rendering">');
    expect(html).toMatch(/fixed\s+allowlist of absolute files/);
    expect(html).toContain("skipping raw HTML");
  });
});
