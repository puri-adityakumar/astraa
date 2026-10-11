import type { TerminalCommand } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { toolDisplayName } from "./tool-names";

interface ToolRowProps {
  command: TerminalCommand;
  showSummary?: boolean;
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
export function ToolRow({ command, showSummary = false, displayName, onRun }: ToolRowProps) {
  const label = displayName ?? (command.slug !== null ? toolDisplayName(command.slug) : command.name);
  const className = cn(
    "group flex min-h-touch items-center gap-3 rounded-md px-3 py-2",
    "font-sans text-sm text-term-fg no-underline",
    "hover:bg-term-surface2 focus-visible:bg-term-surface2",
  );
  const content = (
    <>
      {/* Fixed key column (claude.dev/terminal discipline): every label on
          every list starts at the same x regardless of chip text length. */}
      <span className="inline-flex w-24 shrink-0 items-center justify-center rounded border border-term-surface2 px-1.5 py-0.5 font-mono text-xs text-term-accent transition-colors duration-200 group-hover:text-term-fg">
        {`/${command.name}`}
      </span>
      <span className="truncate transition-transform duration-200 ease-out group-hover:translate-x-1">
        {label}
      </span>
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
