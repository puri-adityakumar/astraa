"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MermaidApi = typeof import("mermaid").default;
type DiagramStatus = "error" | "idle" | "loading" | "rendered";

let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid")
      .then((module) => {
        module.default.initialize({
          deterministicIds: true,
          securityLevel: "strict",
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: "neutral",
        });
        return module.default;
      })
      .catch((error: unknown) => {
        mermaidPromise = null;
        throw error;
      });
  }
  return mermaidPromise;
}

interface MermaidDiagramProps {
  diagramId: string;
  source: string;
}

export function MermaidDiagram({ diagramId, source }: MermaidDiagramProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<DiagramStatus>("idle");
  const [svg, setSvg] = useState<string | null>(null);

  const requestRender = useCallback(() => {
    setStatus("loading");
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || attempt > 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          requestRender();
          observer.disconnect();
        }
      },
      { rootMargin: "160px 0px" },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, [attempt, requestRender]);

  useEffect(() => {
    if (attempt === 0) return;
    let cancelled = false;

    loadMermaid()
      .then((mermaid) => mermaid.render(diagramId, source))
      .then((result) => {
        if (cancelled) return;
        setSvg(result.svg);
        setStatus("rendered");
      })
      .catch(() => {
        if (cancelled) return;
        setSvg(null);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, diagramId, source]);

  return (
    <figure
      ref={figureRef}
      className="not-prose my-6 max-w-full overflow-hidden rounded-lg border bg-card"
      data-mermaid-diagram={diagramId}
    >
      <figcaption className="border-b px-4 py-3 text-sm font-medium">
        Architecture diagram
      </figcaption>
      <div className="grid gap-4 p-4">
        {status === "rendered" && svg ? (
          <div
            className="overflow-x-auto rounded-md bg-white p-4 text-black"
            data-mermaid-rendered="true"
            role="region"
            aria-label="Rendered architecture diagram"
            tabIndex={0}
            // Mermaid's strict security level escapes untrusted diagram content.
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
            {status === "loading"
              ? "Rendering an optional diagram preview…"
              : status === "error"
                ? "The diagram preview could not be rendered. Its source remains available below."
                : "The source below is complete. Render an optional visual preview when useful."}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
            {status === "rendered"
              ? "Diagram preview rendered."
              : status === "error"
                ? "Diagram preview unavailable."
                : status === "loading"
                  ? "Loading the diagram renderer."
                  : "Diagram renderer not loaded."}
          </p>
          {(status === "idle" || status === "error") && (
            <button
              type="button"
              className="inline-flex min-h-touch items-center rounded-md border px-3 text-sm font-medium transition-colors hover:bg-muted"
              onClick={requestRender}
            >
              {status === "error" ? "Retry diagram" : "Render diagram"}
            </button>
          )}
        </div>

        <pre
          className="max-w-full overflow-x-auto rounded-md bg-muted p-4 text-sm"
          data-mermaid-source="true"
          tabIndex={0}
          aria-label="Mermaid diagram source"
        >
          <code>{source}</code>
        </pre>
      </div>
    </figure>
  );
}
