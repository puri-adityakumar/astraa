export function parseConversionAmount(value: string): number | null {
  if (value.trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

export function formatConvertedAmount(
  value: string,
  rate: number | null,
  fractionDigits: number,
): string {
  const amount = parseConversionAmount(value);
  if (amount === null || rate === null || !Number.isFinite(rate) || rate <= 0) return "";
  return (amount * rate).toFixed(fractionDigits);
}
