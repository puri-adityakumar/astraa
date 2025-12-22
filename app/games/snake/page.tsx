"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useSnakeGame } from "@/lib/games/snake/useSnakeGame"
import { RefreshCw } from "lucide-react"

export default function SnakeGame() {
  const { gameState, resetGame, GRID_SIZE } = useSnakeGame()
  const { snake, food, isGameOver, score } = gameState

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold">Snake Game</h1>
        <p className="text-muted-foreground">
          Use arrow keys to control the snake. Eat food to grow longer!
        </p>
      </motion.div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">Score: {score}</p>
          <Button onClick={resetGame} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div
          className="relative aspect-square bg-muted rounded-lg overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '1px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const isSnake = snake.some(segment => segment.x === x && segment.y === y)
            const isFood = food.x === x && food.y === y

            return (
              <div
                key={index}
                className={`
                  ${isSnake ? 'bg-primary' : 'bg-transparent'}
                  ${isFood ? 'bg-accent' : ''}
                `}
              />
            )
          })}

          {isGameOver && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                <p className="text-muted-foreground mb-4">Final Score: {score}</p>
                <Button onClick={resetGame}>Play Again</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}