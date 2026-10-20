import { describe, expect, it, vi } from "vitest";
import { spawnFood } from "./useSnakeGame";

const board = Array.from({ length: 400 }, (_, index) => ({
  x: index % 20,
  y: Math.floor(index / 20),
}));

describe("snake food", () => {
  it("only spawns on cells outside the snake", () => {
    const snake = board.slice(0, -1);
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    try {
      expect(spawnFood(snake)).toEqual({ x: 19, y: 19 });
      random.mockReturnValue(0.9999);
      expect(spawnFood(snake)).toEqual({ x: 19, y: 19 });
    } finally {
      random.mockRestore();
    }
  });

  it("returns null instead of looping when the board is full", () => {
    expect(spawnFood(board)).toBeNull();
  });
});
