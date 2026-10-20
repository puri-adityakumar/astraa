import { describe, expect, it } from "vitest";
import { shuffleCards } from "./useMemoryGame";

describe("memory cards", () => {
  it("creates eight distinct pairs", () => {
    const cards = shuffleCards();
    expect(cards).toHaveLength(16);
    const counts = new Map<string, number>();
    for (const card of cards) counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
    expect(counts.size).toBe(8);
    expect([...counts.values()]).toEqual(Array<number>(8).fill(2));
  });

  it("starts every card hidden, unmatched, and with a unique id", () => {
    const cards = shuffleCards();
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
    expect(cards.every((card) => !card.isFlipped && !card.isMatched)).toBe(true);
  });
});
