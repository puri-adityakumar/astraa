import { describe, it, expect } from "vitest";
import { EMOJIS, buildShuffledDeck } from "./useMemoryGame";

describe("EMOJIS", () => {
  it("has exactly 8 emojis", () => {
    expect(EMOJIS).toHaveLength(8);
  });

  it("contains only unique emojis", () => {
    expect(new Set(EMOJIS).size).toBe(EMOJIS.length);
  });
});

describe("buildShuffledDeck", () => {
  it("returns a deck of 16 cards", () => {
    const deck = buildShuffledDeck();
    expect(deck).toHaveLength(16);
  });

  it("contains exactly 2 copies of each of the 8 emojis", () => {
    const deck = buildShuffledDeck();

    const counts: Record<string, number> = {};
    for (const card of deck) {
      counts[card.value] = (counts[card.value] ?? 0) + 1;
    }

    expect(Object.keys(counts)).toHaveLength(8);
    for (const count of Object.values(counts)) {
      expect(count).toBe(2);
    }
  });

  it("uses only emojis from EMOJIS", () => {
    const allowed = new Set(EMOJIS);
    const deck = buildShuffledDeck();
    for (const card of deck) {
      expect(allowed.has(card.value)).toBe(true);
    }
  });

  it("starts every card unflipped and unmatched", () => {
    const deck = buildShuffledDeck();
    for (const card of deck) {
      expect(card.isFlipped).toBe(false);
      expect(card.isMatched).toBe(false);
    }
  });
});
