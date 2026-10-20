import type { ScrollbackEntry } from "@/lib/terminal/scrollback";
import { OutputBlocks } from "./output-blocks";

export type { ScrollbackEntry } from "@/lib/terminal/scrollback";

function Entry({ entry }: { entry: ScrollbackEntry }) {
  return (
    <li className="space-y-2">
      <p className="flex gap-3 font-mono text-sm leading-6">
        <span aria-hidden="true" className="w-3 shrink-0 text-lg text-term-accent">›</span>
        <span className="min-w-0 break-all text-term-fg [overflow-wrap:anywhere]">
          {entry.input}
        </span>
      </p>
      {entry.output.length > 0 && (
        <div className="flex gap-3">
          <span
            aria-hidden="true"
            className="w-3 shrink-0 font-mono text-sm leading-6 text-term-muted"
          >
            ⎿
          </span>
          <div className="min-w-0 flex-1">
            <OutputBlocks blocks={entry.output} />
          </div>
        </div>
      )}
    </li>
  );
}

/**
 * The scrollback: one entry per submitted line, echoing
 * `› <input>` followed by the indented output blocks. The list
 * replaces the home view while non-empty; the shell scrolls the column to
 * keep the newest entry visible.
 */
export function Scrollback({ entries }: { entries: readonly ScrollbackEntry[] }) {
  return (
    <ul className="space-y-6">
      {entries.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
