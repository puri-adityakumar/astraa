import { Badge } from "@/components/ui/badge";
import { getToolById } from "@/lib/tools";
import { TOOL_GUIDES } from "@/lib/seo/tool-guides";
import type { GuidedToolId } from "@/lib/seo/tool-guides";

type ToolGuideProps = {
  toolId: GuidedToolId;
};

const PROCESSING_LABELS = {
  local: "Local browser processing",
  server: "Provider-backed processing",
  hybrid: "Local and provider-backed processing",
} as const;

export function ToolGuide({ toolId }: ToolGuideProps) {
  const tool = getToolById(toolId);
  if (!tool) throw new Error(`Unknown tool ID: ${toolId}`);

  const guide = TOOL_GUIDES[toolId];

  return (
    <section
      className="mx-auto mt-12 max-w-5xl space-y-8 rounded-xl border bg-card p-6 shadow-geist sm:p-8"
      aria-labelledby={`${toolId}-guide-heading`}
      data-seo-guide={toolId}
    >
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Practical guide
          </span>
          <Badge variant="outline">{PROCESSING_LABELS[tool.processing]}</Badge>
        </div>
        <h2
          id={`${toolId}-guide-heading`}
          className="mt-3 text-2xl font-semibold tracking-[-0.035em]"
        >
          {guide.heading}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">{guide.summary}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <section aria-labelledby={`${toolId}-steps-heading`}>
          <h3 id={`${toolId}-steps-heading`} className="text-base font-semibold">
            Steps
          </h3>
          <ol className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
            {guide.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-xs text-foreground" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby={`${toolId}-capabilities-heading`}>
          <h3 id={`${toolId}-capabilities-heading`} className="text-base font-semibold">
            Supported workflow
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {guide.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </section>
      </div>

      <section
        className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2"
        aria-labelledby={`${toolId}-example-heading`}
      >
        <h3 id={`${toolId}-example-heading`} className="sr-only">
          Example
        </h3>
        <div className="bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">{guide.example.inputLabel}</p>
          <pre
            tabIndex={0}
            aria-label={guide.example.inputLabel}
            className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <code>{guide.example.input}</code>
          </pre>
        </div>
        <div className="bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">{guide.example.outputLabel}</p>
          <pre
            tabIndex={0}
            aria-label={guide.example.outputLabel}
            className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <code>{guide.example.output}</code>
          </pre>
        </div>
      </section>

      <div className="grid gap-8 border-t pt-6 md:grid-cols-2">
        <section aria-labelledby={`${toolId}-processing-heading`}>
          <h3 id={`${toolId}-processing-heading`} className="text-base font-semibold">
            Data handling
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{guide.processing}</p>
        </section>
        <section aria-labelledby={`${toolId}-limits-heading`}>
          <h3 id={`${toolId}-limits-heading`} className="text-base font-semibold">
            Limits and cautions
          </h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {guide.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
