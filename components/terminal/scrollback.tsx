import type { OutputBlock } from "@/lib/terminal/types";
import { OutputBlocks } from "./output-blocks";

export interface ScrollbackEntry {
  id: number;
  input: string;
  output: OutputBlock[];
}

function Entry({ entry }: { entry: ScrollbackEntry }) {
  return (
    <li className="space-y-2">
      <p className="font-mono text-sm">
        <span className="text-term-green">guest@astraa &gt;</span>{" "}
        <span className="break-all text-term-fg">{entry.input}</span>
      </p>
      {entry.output.length > 0 && <OutputBlocks blocks={entry.output} />}
    </li>
  );
}

/**
 * The scrollback: one entry per submitted line, echoing
 * `guest@astraa > <input>` followed by the rendered output blocks. The list
 * replaces the home view while non-empty; the shell scrolls the column to
 * keep the newest entry visible.
 */
export function Scrollback({ entries }: { entries: readonly ScrollbackEntry[] }) {
  return (
    <ul className="space-y-4">
      {entries.map((entry) => (
        <Entry key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}
