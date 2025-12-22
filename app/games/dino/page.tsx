"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDinoGame } from "@/lib/games/dino/useDinoGame"
import { Gamepad2, Globe } from "lucide-react"
import { WorkInProgress } from "@/components/wip"
export default function DinoGame() {
  const [mode, setMode] = useState<'custom' | 'original'>('original')
  const { gameState, startGame, jump, config } = useDinoGame()
  const { score, highScore, isGameOver, dinoY, obstacles, groundX } = gameState

  return (
    <WorkInProgress>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">Chrome Dino</h1>
          <p className="text-muted-foreground">
            The famous Chrome dinosaur game. Choose between the original or our custom version!
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={mode === 'original' ? 'default' : 'outline'}
              onClick={() => setMode('original')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Original
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              onClick={() => setMode('custom')}
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Custom
            </Button>
          </div>
        </motion.div>

        {mode === 'original' ? (
          <Card className="aspect-[2/1] relative overflow-hidden">
            <iframe
              src="https://chromedino.com/"
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </Card>
        ) : (
          <Card
            className="p-6 relative h-[400px] overflow-hidden cursor-pointer"
            onClick={() => isGameOver ? startGame() : jump()}
          >
            {/* Score Display */}
            <div className="absolute top-4 right-4 font-mono text-lg">
              Score: {score}
              {highScore > 0 && (
                <div className="text-sm text-muted-foreground">
                  High Score: {highScore}
                </div>
              )}
            </div>

            {/* Game Over Screen */}
            {isGameOver && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
                  <p className="text-muted-foreground mb-4">
                    Score: {score}
                    {score === highScore && score > 0 && (
                      <span className="block text-primary">New High Score!</span>
                    )}
                  </p>
                  <p className="text-sm">Press Space or click to play again</p>
                </div>
              </div>
            )}

            {/* Dino Character */}
            <motion.div
              className="absolute left-12 bottom-0 w-10 h-[60px] bg-primary"
              animate={{ y: -dinoY }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{ bottom: config.groundHeight }}
            />

            {/* Obstacles */}
            {obstacles.map((obstacle, index) => (
              <motion.div
                key={index}
                className={`absolute bottom-0 bg-destructive`}
                style={{
                  left: obstacle.x,
                  width: obstacle.width,
                  height: obstacle.height,
                  bottom: config.groundHeight
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            ))}

            {/* Ground */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[20px] bg-muted"
              style={{
                backgroundImage: 'linear-gradient(to right, #ccc 50%, transparent 50%)',
                backgroundSize: '20px 100%',
                backgroundPosition: `${groundX}px 0`
              }}
            />
          </Card>
        )}

        <div className="text-center text-sm text-muted-foreground">
          {mode === 'custom' ? (
            <p>Tip: Use the spacebar to jump, or click/tap the game area</p>
          ) : (
            <p>Tip: Press Space to start and jump. The game works just like in Chrome!</p>
          )}
        </div>
      </div>
    </WorkInProgress>
  )
}