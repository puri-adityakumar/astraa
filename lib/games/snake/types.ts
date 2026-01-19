export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };
export type Snake = Position[];
export type Food = Position;

export interface GameState {
  snake: Snake;
  food: Food;
  direction: Direction;
  isGameOver: boolean;
  score: number;
}
