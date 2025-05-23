export interface Card {
  id: number
  value: string
  isFlipped: boolean
  isMatched: boolean
}

export interface GameState {
  cards: Card[]
  flippedCards: Card[]
  isGameOver: boolean
  moves: number
  matches: number
}