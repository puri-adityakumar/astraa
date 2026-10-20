"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

export function spawnFood(snake: Snake): Food | null {
  const occupied = new Set(snake.map(({ x, y }) => y * GRID_SIZE + x));
  const available: Food[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(y * GRID_SIZE + x)) available.push({ x, y });
    }
  }
  return available[Math.floor(Math.random() * available.length)] ?? null;
}

export function useSnakeGame(active = true) {
  const lastMovedDirection = useRef<Direction>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: INITIAL_DIRECTION,
    isGameOver: false,
    score: 0,
  });

  const moveSnake = useCallback(() => {
    if (!active || gameState.isGameOver) return;
    const currentHead = gameState.snake[0];
    if (!currentHead) return;
    const head = { ...currentHead };
    lastMovedDirection.current = gameState.direction;

    switch (gameState.direction) {
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

    const ateFood = head.x === gameState.food.x && head.y === gameState.food.y;
    const body = ateFood ? gameState.snake : gameState.snake.slice(0, -1);
    if (
      head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE ||
      body.some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      setGameState((prev) => ({ ...prev, isGameOver: true }));
      return;
    }

    const snake = [head, ...gameState.snake];
    if (!ateFood) snake.pop();
    const food = ateFood ? spawnFood(snake) : gameState.food;
    setGameState((prev) => ({
      ...prev,
      snake,
      score: prev.score + (ateFood ? 1 : 0),
      food: food ?? prev.food,
      isGameOver: food === null,
    }));
  }, [active, gameState]);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (OPPOSITES[newDirection] !== lastMovedDirection.current) {
      setGameState((prev) => prev.isGameOver ? prev : { ...prev, direction: newDirection });
    }
  }, []);

  const resetGame = useCallback(() => {
    lastMovedDirection.current = INITIAL_DIRECTION;
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: INITIAL_DIRECTION,
      isGameOver: false,
      score: 0,
    });
  }, []);

  useEffect(() => {
    if (!active || gameState.isGameOver) return;
    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("button, input, textarea, select") || target.isContentEditable)
      ) {
        return;
      }
      const directions: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      changeDirection(direction);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [active, gameState.isGameOver, changeDirection]);

  useEffect(() => {
    if (!active || gameState.isGameOver) return;
    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [active, gameState.isGameOver, moveSnake]);

  return { gameState, resetGame, GRID_SIZE };
}
