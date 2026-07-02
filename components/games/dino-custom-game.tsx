"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useDinoGame } from "@/lib/games/dino/useDinoGame";

export function DinoCustomGame() {
  const { gameState, startGame, jump, config } = useDinoGame();
  const { score, highScore, isGameOver, dinoY, obstacles, groundX } = gameState;

  return (
    <Card
      className="p-6 relative overflow-hidden cursor-pointer"
      style={{ height: config.canvasHeight }}
      onClick={() => (isGameOver ? startGame() : jump())}
    >
      {/* Score Display */}
      <div className="absolute top-4 right-4 font-mono text-lg">
        Score: {score}
        {highScore > 0 && (
          <div className="text-sm text-muted-foreground">High Score: {highScore}</div>
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
        className="absolute left-12 bottom-0 bg-primary"
        style={{
          width: config.dinoWidth,
          height: config.dinoHeight,
          bottom: config.groundHeight,
        }}
        animate={{ y: -dinoY }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* Obstacles */}
      {obstacles.map((obstacle, index) => (
        <motion.div
          key={index}
          className="absolute bottom-0 bg-destructive"
          style={{
            left: obstacle.x,
            width: obstacle.width,
            height: obstacle.height,
            bottom: config.groundHeight,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      ))}

      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-muted"
        style={{
          height: config.groundHeight,
          backgroundImage: "linear-gradient(to right, #ccc 50%, transparent 50%)",
          backgroundSize: "20px 100%",
          backgroundPosition: `${groundX}px 0`,
        }}
      />
    </Card>
  );
}
