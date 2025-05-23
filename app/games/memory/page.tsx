"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMemoryGame } from "@/lib/games/memory/useMemoryGame"
import { RefreshCw } from "lucide-react"

export default function MemoryGame() {
  const { gameState, flipCard, resetGame } = useMemoryGame()
  const { cards, moves, matches, isGameOver } = gameState

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div 
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">Memory Game</h1>
        <p className="text-muted-foreground">
          Match pairs of cards to win. Try to complete the game in as few moves as possible!
        </p>
      </motion.div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Moves</p>
            <p className="text-2xl font-semibold">{moves}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Matches</p>
            <p className="text-2xl font-semibold">{matches}</p>
          </div>
          <Button onClick={resetGame} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {cards.map(card => (
            <motion.button
              key={card.id}
              className={`
                aspect-square rounded-lg text-3xl
                ${card.isFlipped || card.isMatched ? 'bg-primary' : 'bg-muted'}
                transition-colors duration-300
              `}
              onClick={() => flipCard(card)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {(card.isFlipped || card.isMatched) && card.value}
            </motion.button>
          ))}
        </div>

        {isGameOver && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
            <p className="text-muted-foreground mb-4">
              You completed the game in {moves} moves
            </p>
            <Button onClick={resetGame}>Play Again</Button>
          </div>
        )}
      </Card>
    </div>
  )
}