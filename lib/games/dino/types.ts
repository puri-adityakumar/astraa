export interface GameState {
  isPlaying: boolean
  score: number
  highScore: number
  isGameOver: boolean
  dinoY: number
  isJumping: boolean
  obstacles: Obstacle[]
  groundX: number
}

export interface Obstacle {
  x: number
  width: number
  height: number
  type: 'cactus' | 'bird'
}

export interface GameConfig {
  groundHeight: number
  dinoHeight: number
  dinoWidth: number
  jumpForce: number
  gravity: number
  gameSpeed: number
  minObstacleDistance: number
  maxObstacleDistance: number
}