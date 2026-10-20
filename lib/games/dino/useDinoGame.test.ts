import { describe, expect, it } from "vitest";
import { checkDinoCollision } from "./useDinoGame";
import type { Obstacle } from "./types";

const obstacle: Obstacle = { x: 60, y: 0, width: 20, height: 50, type: "cactus" };

describe("dino collisions", () => {
  it("collides with a ground obstacle while standing", () => {
    expect(checkDinoCollision(0, obstacle)).toBe(true);
  });

  it("clears the obstacle when jumping above its top", () => {
    expect(checkDinoCollision(50, obstacle)).toBe(false);
    expect(checkDinoCollision(60, obstacle)).toBe(false);
  });

  it("uses the obstacle's vertical position", () => {
    expect(checkDinoCollision(0, { ...obstacle, y: 80 })).toBe(false);
    expect(checkDinoCollision(90, { ...obstacle, y: 80 })).toBe(true);
  });

  it("does not collide with obstacles outside the dinosaur's horizontal range", () => {
    expect(checkDinoCollision(0, { ...obstacle, x: 90 })).toBe(false);
    expect(checkDinoCollision(0, { ...obstacle, x: 10 })).toBe(false);
  });
});
