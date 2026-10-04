import type { ToolCommand } from "@/lib/terminal/rows";
import { cn } from "@/lib/utils";
import { toolDisplayName } from "./tool-names";

interface ToolRowProps {
  command: ToolCommand;
  showSummary?: boolean;
}

/**
 * One registry-driven tool row: key chip + display name as a real link to
 * the tool's public URL (crawlable, works without JS). Panel behaviour later
 * intercepts the click to run the bare command in place.
 */
export function ToolRow({ command, showSummary = false }: ToolRowProps) {
  return (
    <a
      href={`/tools/${command.slug}`}
      className={cn(
        "flex min-h-touch items-center gap-3 rounded-md px-3 py-2",
        "font-sans text-sm text-term-fg no-underline",
        "hover:bg-term-surface2 focus-visible:bg-term-surface2",
      )}
    >
      <span className="shrink-0 rounded border border-term-surface2 px-1.5 py-0.5 font-mono text-xs text-term-accent">
        {`/${command.name}`}
      </span>
      <span className="truncate">{toolDisplayName(command.slug)}</span>
      {command.status === "coming-soon" && (
        <span className="ml-auto shrink-0 font-mono text-xs text-term-muted">soon</span>
      )}
      {showSummary && command.status === "live" && (
        <span className="ml-auto hidden truncate text-xs text-term-muted sm:block">
          {command.summary}
        </span>
      )}
    </a>
  );
}
