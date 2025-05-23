export type UnitCategory = {
  name: string
  units: Unit[]
}

export type Unit = {
  name: string
  symbol: string
  ratio: number // Ratio to base unit
}

export const unitCategories: UnitCategory[] = [
  {
    name: "Length",
    units: [
      { name: "Millimeter", symbol: "mm", ratio: 0.001 },
      { name: "Centimeter", symbol: "cm", ratio: 0.01 },
      { name: "Meter", symbol: "m", ratio: 1 },
      { name: "Kilometer", symbol: "km", ratio: 1000 },
      { name: "Inch", symbol: "in", ratio: 0.0254 },
      { name: "Foot", symbol: "ft", ratio: 0.3048 },
      { name: "Yard", symbol: "yd", ratio: 0.9144 },
      { name: "Mile", symbol: "mi", ratio: 1609.344 }
    ]
  },
  {
    name: "Weight",
    units: [
      { name: "Milligram", symbol: "mg", ratio: 0.001 },
      { name: "Gram", symbol: "g", ratio: 1 },
      { name: "Kilogram", symbol: "kg", ratio: 1000 },
      { name: "Ounce", symbol: "oz", ratio: 28.3495 },
      { name: "Pound", symbol: "lb", ratio: 453.592 },
      { name: "Stone", symbol: "st", ratio: 6350.29 },
      { name: "Metric Ton", symbol: "t", ratio: 1000000 }
    ]
  },
  {
    name: "Temperature",
    units: [
      { name: "Celsius", symbol: "°C", ratio: 1 },
      { name: "Fahrenheit", symbol: "°F", ratio: 1 },
      { name: "Kelvin", symbol: "K", ratio: 1 }
    ]
  }
]

export function convertTemperature(value: number, from: string, to: string): number {
  // First convert to Celsius as base unit
  let celsius: number
  switch (from) {
    case "°F":
      celsius = (value - 32) * 5/9
      break
    case "K":
      celsius = value - 273.15
      break
    default:
      celsius = value
  }

  // Then convert from Celsius to target unit
  switch (to) {
    case "°F":
      return (celsius * 9/5) + 32
    case "K":
      return celsius + 273.15
    default:
      return celsius
  }
}

export function convertUnit(value: number, from: Unit, to: Unit, category: string): number {
  if (category === "Temperature") {
    return convertTemperature(value, from.symbol, to.symbol)
  }
  
  // For other units, use ratio conversion
  const baseValue = value * from.ratio
  return baseValue / to.ratio
}