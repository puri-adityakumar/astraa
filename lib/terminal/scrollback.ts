import type { OutputBlock } from "./types";

export const SCROLLBACK_ENTRY_LIMIT = 200;

export interface ScrollbackEntry {
  id: number;
  input: string;
  output: OutputBlock[];
}

export function appendScrollbackEntry(
  entries: readonly ScrollbackEntry[],
  entry: ScrollbackEntry,
): ScrollbackEntry[] {
  return [...entries, entry].slice(-SCROLLBACK_ENTRY_LIMIT);
}

export function completeScrollbackEntry(
  entries: readonly ScrollbackEntry[],
  id: number,
  output: OutputBlock[],
): ScrollbackEntry[] {
  return entries.map((entry) => (entry.id === id ? { ...entry, output } : entry));
}
