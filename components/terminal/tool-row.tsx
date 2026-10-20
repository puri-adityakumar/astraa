import type { TerminalCommand } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { toolDisplayName } from "./tool-names";

interface ToolRowProps {
  command: TerminalCommand;
  showSummary?: boolean;
  /** Smaller command chips and labels for the right-hand catalogue. */
  compact?: boolean;
  /** Overrides the derived label — used by rows without a tool slug. */
  displayName?: string;
  /** Runs the bare command in place; the href stays for no-JS/crawlers. */
  onRun?: ((input: string) => void) | undefined;
}

/**
 * One registry-driven row: key chip + display name. Commands with a tool
 * page render an <a href="/tools/<slug>>; with `onRun` the plain left click
 * (or Enter on the focused link) runs the bare command — the same path as
 * typing it — instead of navigating. Modified clicks (Cmd/Ctrl/Shift/Alt)
 * and middle clicks fall through so the browser opens /tools/<slug> in a
 * new tab as usual. Commands without a tool page (coming-soon tools, the
 * slug-less browser) render a button that runs the bare command.
 */
export function ToolRow({
  command,
  showSummary = false,
  compact = false,
  displayName,
  onRun,
}: ToolRowProps) {
  const label =
    displayName ?? (command.slug !== null ? toolDisplayName(command.slug) : command.name);
  const className = cn(
    "group flex min-h-touch items-center rounded-md py-2",
    "font-mono text-term-fg no-underline",
    "hover:bg-term-surface2 focus-visible:bg-term-surface2",
    compact ? "gap-2 px-2 text-xs" : "gap-3 px-3 text-sm",
  );
  const content = (
    <>
      {/* Fixed key column (claude.dev/terminal discipline): every label on
          every list starts at the same x regardless of chip text length. */}
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded",
          "border border-term-surface2 py-0.5 font-mono text-term-accent",
          "transition-colors duration-200 group-hover:text-term-fg motion-reduce:transition-none",
          compact ? "w-24 px-1.5 text-[11px]" : "w-24 px-1.5 text-xs",
        )}
      >
        {`/${command.name}`}
      </span>
      <span
        className={cn(
          "min-w-0 truncate transition-transform duration-200 ease-out",
          "group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none",
          showSummary && "lg:w-48 lg:shrink-0",
        )}
      >
        {label}
      </span>
      {command.status === "coming-soon" && (
        <span
          className={cn(
            "ml-auto shrink-0 font-mono text-term-muted",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          soon
        </span>
      )}
      {showSummary && command.status === "live" && (
        <span className="hidden min-w-0 flex-1 truncate font-mono text-xs text-term-muted lg:block">
          {command.summary}
        </span>
      )}
    </>
  );

  if (command.status === "coming-soon" || command.slug === null) {
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
