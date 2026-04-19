import { describe, it, expect } from "vitest";
import { convertUnit, convertTemperature, unitCategories } from "./unit-conversions";

describe("convertTemperature", () => {
  it("converts Celsius to Fahrenheit", () => {
    expect(convertTemperature(0, "°C", "°F")).toBe(32);
  });
  it("converts Fahrenheit to Celsius", () => {
    expect(convertTemperature(32, "°F", "°C")).toBe(0);
  });
  it("converts Celsius to Kelvin", () => {
    expect(convertTemperature(0, "°C", "K")).toBe(273.15);
  });
  it("converts Kelvin to Celsius", () => {
    expect(convertTemperature(273.15, "K", "°C")).toBe(0);
  });
  it("converts 100°C to 212°F", () => {
    expect(convertTemperature(100, "°C", "°F")).toBe(212);
  });
  it("converts same unit to itself", () => {
    expect(convertTemperature(25, "°C", "°C")).toBe(25);
  });
});

describe("convertUnit", () => {
  it("converts meters to kilometers", () => {
    const length = unitCategories.find((c) => c.name === "Length");
    const meter = length!.units.find((u) => u.symbol === "m")!;
    const km = length!.units.find((u) => u.symbol === "km")!;
    expect(convertUnit(1000, meter, km, "Length")).toBeCloseTo(1);
  });
  it("converts kg to grams", () => {
    const mass = unitCategories.find((c) => c.name === "Mass")!;
    const kg = mass.units.find((u) => u.symbol === "kg")!;
    const g = mass.units.find((u) => u.symbol === "g")!;
    expect(convertUnit(1, kg, g, "Mass")).toBeCloseTo(1000);
  });
  it("converts same unit to itself", () => {
    const length = unitCategories.find((c) => c.name === "Length")!;
    const meter = length.units.find((u) => u.symbol === "m")!;
    expect(convertUnit(5, meter, meter, "Length")).toBeCloseTo(5);
  });
  it("delegates temperature to convertTemperature", () => {
    const temp = unitCategories.find((c) => c.name === "Temperature")!;
    const celsius = temp.units.find((u) => u.symbol === "°C")!;
    const fahrenheit = temp.units.find((u) => u.symbol === "°F")!;
    expect(convertUnit(100, celsius, fahrenheit, "Temperature")).toBe(212);
  });
  it("converts bytes to kilobytes", () => {
    const bits = unitCategories.find((c) => c.name === "Bits & Bytes")!;
    const byte = bits.units.find((u) => u.symbol === "B")!;
    const kb = bits.units.find((u) => u.symbol === "KB")!;
    expect(convertUnit(1000, byte, kb, "Bits & Bytes")).toBeCloseTo(1);
  });
});

describe("unitCategories", () => {
  it("has at least 5 categories", () => {
    expect(unitCategories.length).toBeGreaterThanOrEqual(5);
  });
  it("each category has units", () => {
    for (const category of unitCategories) {
      expect(category.units.length).toBeGreaterThan(0);
    }
  });
  it("each unit has name, symbol, and ratio", () => {
    for (const category of unitCategories) {
      for (const unit of category.units) {
        expect(unit.name).toBeTruthy();
        expect(unit.symbol).toBeTruthy();
        expect(typeof unit.ratio).toBe("number");
      }
    }
  });
});
