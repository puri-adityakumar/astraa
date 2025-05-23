"use client"

import { useState, useEffect, useCallback } from 'react'
import type { Direction, Position, Snake, Food, GameState } from './types'

const GRID_SIZE = 20
const INITIAL_SNAKE: Snake = [{ x: 10, y: 10 }]
const INITIAL_FOOD: Food = { x: 15, y: 15 }
const INITIAL_DIRECTION: Direction = 'RIGHT'
const GAME_SPEED = 150

export function useSnakeGame() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: INITIAL_DIRECTION,
    isGameOver: false,
    score: 0
  })

  const moveSnake = useCallback(() => {
    if (gameState.isGameOver) return

    const newSnake = [...gameState.snake]
    const head = { ...newSnake[0] }

    switch (gameState.direction) {
      case 'UP':
        head.y -= 1
        break
      case 'DOWN':
        head.y += 1
        break
      case 'LEFT':
        head.x -= 1
        break
      case 'RIGHT':
        head.x += 1
        break
    }

    // Check collision with walls
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setGameState(prev => ({ ...prev, isGameOver: true }))
      return
    }

    // Check collision with self
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameState(prev => ({ ...prev, isGameOver: true }))
      return
    }

    newSnake.unshift(head)

    // Check if snake ate food
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + 1,
        food: {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        }
      }))
    } else {
      newSnake.pop()
    }

    setGameState(prev => ({ ...prev, snake: newSnake }))
  }, [gameState])

  const changeDirection = useCallback((newDirection: Direction) => {
    const opposites = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT'
    }

    if (opposites[newDirection] !== gameState.direction) {
      setGameState(prev => ({ ...prev, direction: newDirection }))
    }
  }, [gameState.direction])

  const resetGame = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: INITIAL_DIRECTION,
      isGameOver: false,
      score: 0
    })
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          changeDirection('UP')
          break
        case 'ArrowDown':
          changeDirection('DOWN')
          break
        case 'ArrowLeft':
          changeDirection('LEFT')
          break
        case 'ArrowRight':
          changeDirection('RIGHT')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [changeDirection])

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, GAME_SPEED)
    return () => clearInterval(gameLoop)
  }, [moveSnake])

  return {
    gameState,
    resetGame,
    GRID_SIZE
  }
}