"use client"

import { useState, useEffect, useCallback } from 'react'
import type { GameState, Obstacle, GameConfig } from './types'

const GAME_CONFIG: GameConfig = {
  groundHeight: 20,
  dinoHeight: 60,
  dinoWidth: 40,
  jumpForce: 20,
  gravity: 1,
  gameSpeed: 8,
  minObstacleDistance: 300,
  maxObstacleDistance: 600,
}

export function useDinoGame() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    highScore: 0,
    isGameOver: false,
    dinoY: 0,
    isJumping: false,
    obstacles: [],
    groundX: 0,
  })

  const jump = useCallback(() => {
    if (!gameState.isJumping && !gameState.isGameOver) {
      setGameState(prev => ({
        ...prev,
        isJumping: true,
        dinoY: prev.dinoY + GAME_CONFIG.jumpForce
      }))
    }
  }, [gameState.isJumping, gameState.isGameOver])

  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      score: 0,
      highScore: gameState.highScore,
      isGameOver: false,
      dinoY: 0,
      isJumping: false,
      obstacles: [],
      groundX: 0,
    })
  }, [gameState.highScore])

  const checkCollision = useCallback((dino: { y: number }, obstacle: Obstacle) => {
    const dinoHitbox = {
      x: 50,
      y: dino.y,
      width: GAME_CONFIG.dinoWidth,
      height: GAME_CONFIG.dinoHeight,
    }

    return !(
      dinoHitbox.x + dinoHitbox.width < obstacle.x ||
      dinoHitbox.x > obstacle.x + obstacle.width ||
      dinoHitbox.y + dinoHitbox.height < obstacle.height ||
      dinoHitbox.y > obstacle.height + obstacle.height
    )
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (gameState.isGameOver) {
          startGame()
        } else {
          jump()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isGameOver, jump, startGame])

  useEffect(() => {
    if (!gameState.isPlaying) return

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        // Update dino position
        let newDinoY = prev.dinoY
        if (prev.isJumping) {
          newDinoY -= GAME_CONFIG.gravity
          if (newDinoY <= 0) {
            newDinoY = 0
          }
        }

        // Update obstacles
        const newObstacles = prev.obstacles
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - GAME_CONFIG.gameSpeed
          }))
          .filter(obstacle => obstacle.x + obstacle.width > 0)

        // Generate new obstacles
        if (newObstacles.length === 0 || 
            newObstacles[newObstacles.length - 1].x < 
            window.innerWidth - Math.random() * 
            (GAME_CONFIG.maxObstacleDistance - GAME_CONFIG.minObstacleDistance) - 
            GAME_CONFIG.minObstacleDistance) {
          newObstacles.push({
            x: window.innerWidth,
            width: 20,
            height: 50,
            type: Math.random() > 0.7 ? 'bird' : 'cactus'
          })
        }

        // Check collisions
        const collision = newObstacles.some(obstacle => 
          checkCollision({ y: newDinoY }, obstacle)
        )

        if (collision) {
          return {
            ...prev,
            isPlaying: false,
            isGameOver: true,
            highScore: Math.max(prev.score, prev.highScore)
          }
        }

        // Update ground position
        const newGroundX = (prev.groundX - GAME_CONFIG.gameSpeed) % 300

        return {
          ...prev,
          dinoY: newDinoY,
          isJumping: newDinoY > 0,
          obstacles: newObstacles,
          score: prev.score + 1,
          groundX: newGroundX
        }
      })
    }, 1000 / 60)

    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, checkCollision])

  return {
    gameState,
    startGame,
    jump,
    config: GAME_CONFIG
  }
}