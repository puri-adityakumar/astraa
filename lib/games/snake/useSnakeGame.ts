"use client";

import { useState, useEffect, useCallback } from "react";
import type { Direction, Snake, Food, GameState } from "./types";

const GRID_SIZE = 20;
const INITIAL_SNAKE: Snake = [{ x: 10, y: 10 }];
const INITIAL_FOOD: Food = { x: 15, y: 15 };
const INITIAL_DIRECTION: Direction = "RIGHT";
const GAME_SPEED = 150;

const OPPOSITES: Record<Direction, Direction> = {
  UP: "DOWN",
  DOWN: "UP",
  LEFT: "RIGHT",
  RIGHT: "LEFT",
};

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: INITIAL_DIRECTION,
    isGameOver: false,
    score: 0,
  });

  // Reads latest state via the functional updater so the callbacks are stable
  // (empty deps). This keeps the game-loop interval from being torn down and
  // recreated on every tick — it's set up once and reuses the latest state.
  const moveSnake = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameOver) return prev;

      const newSnake = [...prev.snake];
      const currentHead = newSnake[0];
      if (!currentHead) return prev;

      const head = { ...currentHead };

      switch (prev.direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check collision with walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return { ...prev, isGameOver: true };
      }

      // Check collision with self
      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        return { ...prev, isGameOver: true };
      }

      newSnake.unshift(head);

      // Check if snake ate food
      if (head.x === prev.food.x && head.y === prev.food.y) {
        return {
          ...prev,
          snake: newSnake,
          score: prev.score + 1,
          food: {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
          },
        };
      }

      newSnake.pop();
      return { ...prev, snake: newSnake };
    });
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState((prev) =>
      OPPOSITES[newDirection] !== prev.direction ? { ...prev, direction: newDirection } : prev,
    );
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: INITIAL_DIRECTION,
      isGameOver: false,
      score: 0,
    });
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          changeDirection("UP");
          break;
        case "ArrowDown":
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
          changeDirection("LEFT");
          break;
        case "ArrowRight":
          changeDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [changeDirection]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return {
    gameState,
    resetGame,
    GRID_SIZE,
  };
}
