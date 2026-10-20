"use client";

import { useState, useEffect, useRef } from "react";
import type { Card, GameState } from "./types";

const EMOJIS = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎸", "🚀"];

export function shuffleCards(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!];
  }
  return pairs.map((value, id) => ({ id, value, isFlipped: false, isMatched: false }));
}

export function useMemoryGame() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => ({
    cards: shuffleCards(),
    flippedCards: [],
    isGameOver: false,
    moves: 0,
    matches: 0,
  }));

  const flipCard = (card: Card) => {
    setGameState((prev) => {
      const currentCard = prev.cards.find((candidate) => candidate.id === card.id);
      if (!currentCard || currentCard.isMatched || currentCard.isFlipped ||
        prev.flippedCards.length === 2) return prev;
      const flippedCards = [...prev.flippedCards, currentCard];
      return {
        ...prev,
        cards: prev.cards.map((candidate) =>
          candidate.id === card.id ? { ...candidate, isFlipped: true } : candidate,
        ),
        flippedCards,
        moves: prev.moves + (flippedCards.length === 2 ? 1 : 0),
      };
    });
  };

  useEffect(() => {
    const [first, second] = gameState.flippedCards;
    if (!first || !second) return;
    const matched = first.value === second.value;

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setGameState((prev) => {
        if (prev.flippedCards[0] !== first || prev.flippedCards[1] !== second) return prev;
        const matches = prev.matches + (matched ? 1 : 0);
        return {
          ...prev,
          cards: prev.cards.map((card) =>
            card.id === first.id || card.id === second.id
              ? { ...card, isMatched: matched, isFlipped: matched }
              : card,
          ),
          flippedCards: [],
          matches,
          isGameOver: matches === EMOJIS.length,
        };
      });
    }, matched ? 500 : 1000);

    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, [gameState.flippedCards]);

  const resetGame = () => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setGameState({
      cards: shuffleCards(),
      flippedCards: [],
      isGameOver: false,
      moves: 0,
      matches: 0,
    });
  };

  return { gameState, flipCard, resetGame };
}
