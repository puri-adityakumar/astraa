import { describe, expect, it } from 'vitest'
import { buildShuffledDeck } from './useMemoryGame'

describe('memory game deck', () => {
  it('builds 16 cards with exactly 8 unique emoji pairs', () => {
    const deck = buildShuffledDeck()
    expect(deck).toHaveLength(16)
    const counts = new Map<string, number>()
    deck.forEach((card) => counts.set(card.value, (counts.get(card.value) ?? 0) + 1))
    expect(counts.size).toBe(8)
    for (const count of counts.values()) expect(count).toBe(2)
  })
})
