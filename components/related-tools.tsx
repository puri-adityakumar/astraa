import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getToolById } from "@/lib/tools";
import type { Tool, ToolId } from "@/lib/tools";

type RelatedToolsProps = {
  toolId: ToolId;
};

function isAvailableTool(tool: Tool | undefined): tool is Tool {
  return tool?.status === "available";
}

export function RelatedTools({ toolId }: RelatedToolsProps) {
  const tool = getToolById(toolId);
  if (!tool) throw new Error(`Unknown tool ID: ${toolId}`);

  const relatedTools = tool.relatedToolIds.map(getToolById).filter(isAvailableTool);

  return (
    <aside className="mx-auto mt-12 max-w-5xl border-t pt-8" aria-labelledby={`${toolId}-related`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Continue your workflow
          </p>
          <h2 id={`${toolId}-related`} className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            Related tools
          </h2>
        </div>
        <Link
          href="/tools"
          className="inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          View all tools
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {relatedTools.map((relatedTool) => (
          <Link
            key={relatedTool.id}
            href={relatedTool.path}
            className="group flex min-h-touch items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-background-2"
          >
            <span>
              <span className="block text-sm font-medium">{relatedTool.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {relatedTool.description}
              </span>
            </span>
            <ArrowRight
              className="ml-3 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </aside>
  );
}
