import type { JsonValue } from "./types";

type SerializeOptions = {
  indent: 2 | 4 | "tab";
  sortKeys: boolean;
};

function sortDeep(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const out: Record<string, JsonValue> = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortDeep((value as Record<string, JsonValue>)[key] as JsonValue);
    }
    return out;
  }
  return value;
}

export function serialize(value: JsonValue, opts: SerializeOptions): string {
  const indent = opts.indent === "tab" ? "\t" : opts.indent;
  const prepared = opts.sortKeys ? sortDeep(value) : value;
  return JSON.stringify(prepared, null, indent);
}
