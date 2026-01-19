export type UnitCategory = {
  name: string;
  units: Unit[];
};

export type Unit = {
  name: string;
  symbol: string;
  ratio: number; // Ratio to base unit (usually SI unit)
};

export const unitCategories: UnitCategory[] = [
  {
    name: "Angle",
    units: [
      { name: "Degree", symbol: "deg", ratio: 1 },
      { name: "Radian", symbol: "rad", ratio: 57.2958 },
      { name: "Gradian", symbol: "grad", ratio: 0.9 },
      { name: "Arcminute", symbol: "arcmin", ratio: 1 / 60 },
      { name: "Arcsecond", symbol: "arcsec", ratio: 1 / 3600 },
    ],
  },
  {
    name: "Area",
    units: [
      { name: "Square Meter", symbol: "m²", ratio: 1 },
      { name: "Square Kilometer", symbol: "km²", ratio: 1e6 },
      { name: "Square Mile", symbol: "mi²", ratio: 2.59e6 },
      { name: "Icon", symbol: "ac", ratio: 4046.86 },
      { name: "Hectare", symbol: "ha", ratio: 10000 },
      { name: "Square Foot", symbol: "ft²", ratio: 0.092903 },
      { name: "Square Inch", symbol: "in²", ratio: 0.00064516 },
    ],
  },
  {
    name: "Bits & Bytes",
    units: [
      { name: "Bit", symbol: "b", ratio: 1 },
      { name: "Byte", symbol: "B", ratio: 8 },
      { name: "Kilobit", symbol: "Kb", ratio: 1000 },
      { name: "Kilobyte", symbol: "KB", ratio: 8000 },
      { name: "Kibibyte", symbol: "KiB", ratio: 8192 },
      { name: "Megabit", symbol: "Mb", ratio: 1e6 },
      { name: "Megabyte", symbol: "MB", ratio: 8e6 },
      { name: "Mebibyte", symbol: "MiB", ratio: 8.389e6 },
      { name: "Gigabit", symbol: "Gb", ratio: 1e9 },
      { name: "Gigabyte", symbol: "GB", ratio: 8e9 },
      { name: "Gibibyte", symbol: "GiB", ratio: 8.59e9 },
      { name: "Terabit", symbol: "Tb", ratio: 1e12 },
      { name: "Terabyte", symbol: "TB", ratio: 8e12 },
      { name: "Tebibyte", symbol: "TiB", ratio: 8.796e12 },
    ],
  },
  {
    name: "Density",
    units: [
      { name: "kg/Cubic Meter", symbol: "kg/m³", ratio: 1 },
      { name: "g/Cubic Centimeter", symbol: "g/cm³", ratio: 1000 },
      { name: "lb/Cubic Foot", symbol: "lb/ft³", ratio: 16.0185 },
      { name: "lb/Cubic Inch", symbol: "lb/in³", ratio: 27679.9 },
    ],
  },
  {
    name: "Electric Current",
    units: [
      { name: "Ampere", symbol: "A", ratio: 1 },
      { name: "Milliampere", symbol: "mA", ratio: 0.001 },
      { name: "Kiloampere", symbol: "kA", ratio: 1000 },
    ],
  },
  {
    name: "Energy",
    units: [
      { name: "Joule", symbol: "J", ratio: 1 },
      { name: "Kilojoule", symbol: "kJ", ratio: 1000 },
      { name: "Calorie", symbol: "cal", ratio: 4.184 },
      { name: "Kilocalorie", symbol: "kcal", ratio: 4184 },
      { name: "Watt-hour", symbol: "Wh", ratio: 3600 },
      { name: "Kilowatt-hour", symbol: "kWh", ratio: 3.6e6 },
      { name: "Electronvolt", symbol: "eV", ratio: 1.60218e-19 },
      { name: "British Thermal Unit", symbol: "BTU", ratio: 1055.06 },
    ],
  },
  {
    name: "Force",
    units: [
      { name: "Newton", symbol: "N", ratio: 1 },
      { name: "Kilonewton", symbol: "kN", ratio: 1000 },
      { name: "Dyne", symbol: "dyn", ratio: 1e-5 },
      { name: "Pound-force", symbol: "lbf", ratio: 4.44822 },
    ],
  },
  {
    name: "Fuel Consumption",
    units: [
      { name: "Kilometers/Liter", symbol: "km/L", ratio: 1 },
      { name: "Miles/Gallon (US)", symbol: "mpg (US)", ratio: 0.425144 },
      { name: "Miles/Gallon (UK)", symbol: "mpg (UK)", ratio: 0.354006 },
    ],
  },
  {
    name: "Length",
    units: [
      { name: "Meter", symbol: "m", ratio: 1 },
      { name: "Kilometer", symbol: "km", ratio: 1000 },
      { name: "Centimeter", symbol: "cm", ratio: 0.01 },
      { name: "Millimeter", symbol: "mm", ratio: 0.001 },
      { name: "Micrometer", symbol: "µm", ratio: 1e-6 },
      { name: "Nanometer", symbol: "nm", ratio: 1e-9 },
      { name: "Mile", symbol: "mi", ratio: 1609.34 },
      { name: "Yard", symbol: "yd", ratio: 0.9144 },
      { name: "Foot", symbol: "ft", ratio: 0.3048 },
      { name: "Inch", symbol: "in", ratio: 0.0254 },
      { name: "Nautical Mile", symbol: "nmi", ratio: 1852 },
    ],
  },
  {
    name: "Mass",
    units: [
      { name: "Kilogram", symbol: "kg", ratio: 1000 },
      { name: "Gram", symbol: "g", ratio: 1 },
      { name: "Milligram", symbol: "mg", ratio: 0.001 },
      { name: "Metric Ton", symbol: "t", ratio: 1e6 },
      { name: "Pound", symbol: "lb", ratio: 453.592 },
      { name: "Ounce", symbol: "oz", ratio: 28.3495 },
      { name: "Stone", symbol: "st", ratio: 6350.29 },
    ],
  },
  {
    name: "Power",
    units: [
      { name: "Watt", symbol: "W", ratio: 1 },
      { name: "Kilowatt", symbol: "kW", ratio: 1000 },
      { name: "Megawatt", symbol: "MW", ratio: 1e6 },
      { name: "Horsepower", symbol: "hp", ratio: 745.7 },
    ],
  },
  {
    name: "Pressure",
    units: [
      { name: "Pascal", symbol: "Pa", ratio: 1 },
      { name: "Kilopascal", symbol: "kPa", ratio: 1000 },
      { name: "Bar", symbol: "bar", ratio: 100000 },
      { name: "PSI", symbol: "psi", ratio: 6894.76 },
      { name: "Standard Atmosphere", symbol: "atm", ratio: 101325 },
    ],
  },
  {
    name: "Speed",
    units: [
      { name: "Meters/Second", symbol: "m/s", ratio: 1 },
      { name: "Kilometers/Hour", symbol: "km/h", ratio: 0.277778 },
      { name: "Miles/Hour", symbol: "mph", ratio: 0.44704 },
      { name: "Knot", symbol: "kn", ratio: 0.514444 },
      { name: "Speed of Light", symbol: "c", ratio: 299792458 },
    ],
  },
  {
    name: "Temperature",
    units: [
      { name: "Celsius", symbol: "°C", ratio: 1 },
      { name: "Fahrenheit", symbol: "°F", ratio: 1 },
      { name: "Kelvin", symbol: "K", ratio: 1 },
    ],
  },
  {
    name: "Time",
    units: [
      { name: "Second", symbol: "s", ratio: 1 },
      { name: "Millisecond", symbol: "ms", ratio: 0.001 },
      { name: "Minute", symbol: "min", ratio: 60 },
      { name: "Hour", symbol: "h", ratio: 3600 },
      { name: "Day", symbol: "d", ratio: 86400 },
      { name: "Week", symbol: "wk", ratio: 604800 },
      { name: "Month (Avg)", symbol: "mo", ratio: 2.628e6 },
      { name: "Year (Avg)", symbol: "yr", ratio: 3.154e7 },
    ],
  },
  {
    name: "Volume",
    units: [
      { name: "Liter", symbol: "L", ratio: 1 },
      { name: "Milliliter", symbol: "mL", ratio: 0.001 },
      { name: "Cubic Meter", symbol: "m³", ratio: 1000 },
      { name: "Gallon (US)", symbol: "gal", ratio: 3.78541 },
      { name: "Quart (US)", symbol: "qt", ratio: 0.946353 },
      { name: "Pint (US)", symbol: "pt", ratio: 0.473176 },
      { name: "Cup (US)", symbol: "cup", ratio: 0.24 },
      { name: "Fluid Ounce (US)", symbol: "fl oz", ratio: 0.0295735 },
    ],
  },
];

export function convertTemperature(
  value: number,
  from: string,
  to: string,
): number {
  // First convert to Celsius as base unit
  let celsius: number;
  switch (from) {
    case "°F":
      celsius = ((value - 32) * 5) / 9;
      break;
    case "K":
      celsius = value - 273.15;
      break;
    default:
      celsius = value;
  }

  // Then convert from Celsius to target unit
  switch (to) {
    case "°F":
      return (celsius * 9) / 5 + 32;
    case "K":
      return celsius + 273.15;
    default:
      return celsius;
  }
}

export function convertUnit(
  value: number,
  from: Unit,
  to: Unit,
  category: string,
): number {
  if (category === "Temperature") {
    return convertTemperature(value, from.symbol, to.symbol);
  }

  // For other units, use ratio conversion
  // value (in from unit) * from.ratio = value (in base unit)
  // value (in base unit) / to.ratio = value (in to unit)
  const baseValue = value * from.ratio;
  return baseValue / to.ratio;
}
