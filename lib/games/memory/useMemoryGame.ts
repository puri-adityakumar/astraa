"use client"

import { useState, useEffect } from 'react'
import type { Card, GameState } from './types'

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯']

export function useMemoryGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    cards: shuffleCards(),
    flippedCards: [],
    isGameOver: false,
    moves: 0,
    matches: 0
  }))

  function shuffleCards(): Card[] {
    const pairs = [...EMOJIS, ...EMOJIS]
    return pairs
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }))
  }

  const flipCard = (card: Card) => {
    if (
      card.isMatched ||
      card.isFlipped ||
      gameState.flippedCards.length === 2
    ) {
      return
    }

    const newCards = gameState.cards.map(c =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    )

    const newFlippedCards = [...gameState.flippedCards, card]

    setGameState(prev => ({
      ...prev,
      cards: newCards,
      flippedCards: newFlippedCards,
      moves: prev.moves + (newFlippedCards.length === 2 ? 1 : 0)
    }))
  }

  useEffect(() => {
    if (gameState.flippedCards.length === 2) {
      const [first, second] = gameState.flippedCards

      if (!first || !second) return

      if (first.value === second.value) {
        const newCards = gameState.cards.map(card =>
          card.id === first.id || card.id === second.id
            ? { ...card, isMatched: true }
            : card
        )

        const newMatches = gameState.matches + 1
        const isGameOver = newMatches === EMOJIS.length

        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            cards: newCards,
            flippedCards: [],
            matches: newMatches,
            isGameOver
          }))
        }, 500)
      } else {
        setTimeout(() => {
          const newCards = gameState.cards.map(card =>
            card.id === first.id || card.id === second.id
              ? { ...card, isFlipped: false }
              : card
          )

          setGameState(prev => ({
            ...prev,
            cards: newCards,
            flippedCards: []
          }))
        }, 1000)
      }
    }
  }, [gameState.flippedCards])

  const resetGame = () => {
    setGameState({
      cards: shuffleCards(),
      flippedCards: [],
      isGameOver: false,
      moves: 0,
      matches: 0
    })
  }

  return {
    gameState,
    flipCard,
    resetGame
  }
}