import { describe, it, expect } from "vitest";
import {
  evaluateExpression,
  scientificFunctions,
  applyScientificFunction,
} from "./calculator-utils";

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

describe("evaluateExpression — parentheses", () => {
  it("handles nested parentheses", () => {
    expect(evaluateExpression("2*(3+4)")).toBe(14);
  });
  it("handles multiple grouped factors", () => {
    expect(evaluateExpression("(2+3)*(4+1)")).toBe(25);
  });
  it("handles redundant parentheses", () => {
    expect(evaluateExpression("((2+3))")).toBe(5);
  });
  it("handles division of a grouped sum", () => {
    expect(evaluateExpression("10/(2+3)")).toBe(2);
  });
});

describe("evaluateExpression — exponent associativity", () => {
  it("is right-associative: 2^3^2 = 2^(3^2) = 512", () => {
    expect(evaluateExpression("2^3^2")).toBe(512);
  });
  it("left grouping overrides associativity: (2^3)^2 = 64", () => {
    expect(evaluateExpression("(2^3)^2")).toBe(64);
  });
  it("is right-associative: 2^2^3 = 2^(2^3) = 256", () => {
    expect(evaluateExpression("2^2^3")).toBe(256);
  });
});

describe("evaluateExpression — percent", () => {
  // % is a postfix unary "divide by 100" operator binding to the preceding
  // operand, so 50% -> 0.5.
  it("converts a standalone percent: 50% = 0.5", () => {
    expect(evaluateExpression("50%")).toBe(0.5);
  });
  // 5% -> 0.05 first, so 200*5% = 200*0.05 = 10.
  it("applies percent before multiplication: 200*5% = 10", () => {
    expect(evaluateExpression("200*5%")).toBe(10);
  });
  // 10% -> 0.1 first, so 100+10% = 100+0.1 = 100.1.
  it("applies percent before addition: 100+10% = 100.1", () => {
    expect(evaluateExpression("100+10%")).toBe(100.1);
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

describe("applyScientificFunction", () => {
  describe("DEG mode", () => {
    it("sin(180°) snaps to 0 (not ~1.2e-16)", () => {
      expect(applyScientificFunction("sin", 180, "DEG")).toBe(0);
    });
    it("sin(90°) snaps to 1", () => {
      expect(applyScientificFunction("sin", 90, "DEG")).toBe(1);
    });
    it("cos(180°) snaps to -1", () => {
      expect(applyScientificFunction("cos", 180, "DEG")).toBe(-1);
    });
    it("cos(0°) snaps to 1", () => {
      expect(applyScientificFunction("cos", 0, "DEG")).toBe(1);
    });
    it("tan(45°) snaps to 1", () => {
      expect(applyScientificFunction("tan", 45, "DEG")).toBe(1);
    });
  });

  describe("RAD mode", () => {
    it("sin(π) snaps to 0", () => {
      expect(applyScientificFunction("sin", Math.PI, "RAD")).toBe(0);
    });
    it("sin(π/2) snaps to 1", () => {
      expect(applyScientificFunction("sin", Math.PI / 2, "RAD")).toBe(1);
    });
    it("cos(0) snaps to 1", () => {
      expect(applyScientificFunction("cos", 0, "RAD")).toBe(1);
    });
  });
});
