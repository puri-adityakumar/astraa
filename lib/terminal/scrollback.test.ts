import { describe, expect, it } from "vitest";
import {
  appendScrollbackEntry,
  completeScrollbackEntry,
  SCROLLBACK_ENTRY_LIMIT,
  type ScrollbackEntry,
} from "./scrollback";
import type { OutputBlock } from "./types";

function entry(id: number): ScrollbackEntry {
  return { id, input: `/command ${id}`, output: [] };
}

describe("scrollback entries", () => {
  it("keeps submission order when commands complete in reverse order", () => {
    const first = entry(1);
    const second = entry(2);
    const reserved = appendScrollbackEntry(appendScrollbackEntry([], first), second);
    const secondOutput: OutputBlock[] = [{ type: "text", text: "second" }];
    const firstOutput: OutputBlock[] = [{ type: "text", text: "first" }];
    const completed = completeScrollbackEntry(
      completeScrollbackEntry(reserved, second.id, secondOutput),
      first.id,
      firstOutput,
    );

    expect(completed).toEqual([
      { ...first, output: firstOutput },
      { ...second, output: secondOutput },
    ]);
    expect(reserved).toEqual([first, second]);
  });

  it("keeps only the newest 200 submitted entries", () => {
    let entries: ScrollbackEntry[] = [];
    for (let id = 1; id <= SCROLLBACK_ENTRY_LIMIT + 2; id++) {
      entries = appendScrollbackEntry(entries, entry(id));
    }

    expect(entries).toHaveLength(200);
    expect(entries[0]?.id).toBe(3);
    expect(entries.at(-1)?.id).toBe(202);
  });

  it("does not restore a cleared or evicted entry when its result arrives", () => {
    const output: OutputBlock[] = [{ type: "text", text: "late" }];
    expect(completeScrollbackEntry([], 1, output)).toEqual([]);
    expect(completeScrollbackEntry([entry(2)], 1, output)).toEqual([entry(2)]);
  });
});
