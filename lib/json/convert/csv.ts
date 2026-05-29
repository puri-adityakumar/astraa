import type { JsonValue } from "../types";

export type CsvResult =
  | { ok: true; value: JsonValue }
  | { ok: false; error: string };

export function isCsvCompatible(value: JsonValue): boolean {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every(
    (item) =>
      item !== null &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      Object.values(item).every(
        (v) => v === null || typeof v !== "object",
      ),
  );
}

export async function jsonToCsv(value: JsonValue): Promise<string> {
  if (!isCsvCompatible(value)) {
    throw new Error("JSON is not CSV-compatible (must be an array of flat objects)");
  }
  const Papa = await import("papaparse");
  return Papa.unparse(value as Record<string, JsonValue>[]);
}

export async function csvToJson(text: string): Promise<CsvResult> {
  try {
    const Papa = await import("papaparse");
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (parsed.errors.length > 0) {
      return { ok: false, error: parsed.errors[0]?.message ?? "CSV parse error" };
    }
    return { ok: true, value: parsed.data as JsonValue };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
