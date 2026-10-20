"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { GameState, Obstacle, GameConfig } from "./types";

const GAME_CONFIG: GameConfig = {
  groundHeight: 20,
  dinoHeight: 60,
  dinoWidth: 40,
  jumpForce: 20,
  gravity: 1,
  gameSpeed: 8,
  minObstacleDistance: 300,
  maxObstacleDistance: 600,
};

export function checkDinoCollision(dinoY: number, obstacle: Obstacle): boolean {
  return (
    48 + GAME_CONFIG.dinoWidth > obstacle.x &&
    48 < obstacle.x + obstacle.width &&
    dinoY + GAME_CONFIG.dinoHeight > obstacle.y &&
    dinoY < obstacle.y + obstacle.height
  );
}

export function useDinoGame(active = true) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    highScore: 0,
    isGameOver: false,
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [],
    groundX: 0,
  });

  const jump = useCallback(() => {
    setGameState((prev) => {
      if (!prev.isPlaying || prev.isJumping || prev.isGameOver) return prev;
      return { ...prev, isJumping: true, dinoVelocity: GAME_CONFIG.jumpForce };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      isPlaying: true,
      score: 0,
      highScore: prev.highScore,
      isGameOver: false,
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      groundX: 0,
    }));
  }, []);

  useEffect(() => {
    if (!active) return;
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("button, input, textarea, select") || target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      if (!gameState.isPlaying || gameState.isGameOver) startGame();
      else jump();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [active, gameState.isPlaying, gameState.isGameOver, jump, startGame]);

  useEffect(() => {
    if (!active || !gameState.isPlaying) return;

    const gameLoop = setInterval(() => {
      const width = gameContainerRef.current?.clientWidth;
      if (!width) return;
      const obstacleDistance = GAME_CONFIG.minObstacleDistance + Math.random() *
        (GAME_CONFIG.maxObstacleDistance - GAME_CONFIG.minObstacleDistance);
      const obstacleType = Math.random() > 0.7 ? "bird" : "cactus";

      setGameState((prev) => {
        if (!prev.isPlaying) return prev;
        const velocity = prev.isJumping ? prev.dinoVelocity - GAME_CONFIG.gravity : 0;
        const newDinoY = Math.max(0, prev.dinoY + velocity);
        const newObstacles = prev.obstacles
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - GAME_CONFIG.gameSpeed }))
          .filter((obstacle) => obstacle.x + obstacle.width > 0);
        const lastObstacle = newObstacles[newObstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < width - obstacleDistance) {
          newObstacles.push({
            x: width,
            y: 0,
            width: 20,
            height: 50,
            type: obstacleType,
          });
        }

        if (newObstacles.some((obstacle) => checkDinoCollision(newDinoY, obstacle))) {
          return {
            ...prev,
            isPlaying: false,
            isGameOver: true,
            highScore: Math.max(prev.score, prev.highScore),
          };
        }

        return {
          ...prev,
          dinoY: newDinoY,
          dinoVelocity: newDinoY > 0 ? velocity : 0,
          isJumping: newDinoY > 0,
          obstacles: newObstacles,
          score: prev.score + 1,
          groundX: (prev.groundX - GAME_CONFIG.gameSpeed) % 300,
        };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [active, gameState.isPlaying]);

  return { gameState, startGame, jump, gameContainerRef, config: GAME_CONFIG };
}
