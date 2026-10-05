import type { ToolCommand } from "@/lib/terminal/rows";
import { cn } from "@/lib/utils";
import { toolDisplayName } from "./tool-names";

interface ToolRowProps {
  command: ToolCommand;
  showSummary?: boolean;
  /** Runs the bare command in place; the href stays for no-JS/crawlers. */
  onRun?: ((input: string) => void) | undefined;
}

/**
 * One registry-driven tool row: key chip + display name. Live commands
 * render an <a href="/tools/<slug>>; with `onRun` the plain left click (or
 * Enter on the focused link) runs the bare command — the same path as
 * typing it — instead of navigating. Modified clicks (Cmd/Ctrl/Shift/Alt)
 * and middle clicks fall through so the browser opens /tools/<slug> in a
 * new tab as usual. Coming-soon commands render a button (no anchor —
 * there is no tool page to link to) that runs the bare command.
 */
export function ToolRow({ command, showSummary = false, onRun }: ToolRowProps) {
  const className = cn(
    "flex min-h-touch items-center gap-3 rounded-md px-3 py-2",
    "font-sans text-sm text-term-fg no-underline",
    "hover:bg-term-surface2 focus-visible:bg-term-surface2",
  );
  const content = (
    <>
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
    </>
  );

  if (command.status === "coming-soon") {
    return (
      <button
        type="button"
        onClick={onRun ? () => onRun(`/${command.name}`) : undefined}
        className={cn(className, "w-full text-left")}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={`/tools/${command.slug}`}
      onClick={(event) => {
        if (!onRun) return;
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        onRun(`/${command.name}`);
      }}
      className={className}
    >
      {content}
    </a>
  );
}
