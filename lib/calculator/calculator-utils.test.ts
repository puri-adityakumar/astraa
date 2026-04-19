import { describe, it, expect } from "vitest";
import { evaluateExpression, scientificFunctions } from "./calculator-utils";

describe("evaluateExpression", () => {
  it("evaluates basic addition", () => {
    expect(evaluateExpression("2+3")).toBe(5);
  });
  it("evaluates basic subtraction", () => {
    expect(evaluateExpression("10-4")).toBe(6);
  });
  it("evaluates multiplication", () => {
    expect(evaluateExpression("3*4")).toBe(12);
  });
  it("evaluates division", () => {
    expect(evaluateExpression("10/2")).toBe(5);
  });
  it("respects operator precedence", () => {
    expect(evaluateExpression("2+3*4")).toBe(14);
  });
  it("handles exponentiation", () => {
    expect(evaluateExpression("2^3")).toBe(8);
  });
  it("handles chained operations", () => {
    expect(evaluateExpression("1+2+3+4")).toBe(10);
  });
  it("returns 0 for empty string", () => {
    expect(evaluateExpression("")).toBe(0);
  });
  it("handles whitespace", () => {
    expect(evaluateExpression(" 2 + 3 ")).toBe(5);
  });
  it("handles decimal numbers", () => {
    expect(evaluateExpression("1.5+2.5")).toBe(4);
  });
  it("handles division by zero", () => {
    expect(evaluateExpression("5/0")).toBe(Infinity);
  });
});

describe("scientificFunctions", () => {
  it("calculates factorial of 0", () => {
    expect(scientificFunctions.fact(0)).toBe(1);
  });
  it("calculates factorial of 5", () => {
    expect(scientificFunctions.fact(5)).toBe(120);
  });
  it("returns NaN for negative factorial", () => {
    expect(scientificFunctions.fact(-1)).toBeNaN();
  });
  it("calculates sqrt", () => {
    expect(scientificFunctions.sqrt(9)).toBe(3);
  });
  it("calculates abs", () => {
    expect(scientificFunctions.abs(-5)).toBe(5);
  });
  it("calculates log10", () => {
    expect(scientificFunctions.log(100)).toBe(2);
  });
  it("calculates natural log", () => {
    expect(scientificFunctions.ln(Math.E)).toBeCloseTo(1);
  });
});
