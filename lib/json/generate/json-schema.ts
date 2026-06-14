import type { JsonValue } from "../types";

type Schema = {
  type: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
};

export function generateJsonSchema(value: JsonValue): Schema {
  if (value === null) return { type: "null" };
  if (typeof value === "string") return { type: "string" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" };
  }
  if (Array.isArray(value)) {
    const itemSchema =
      value.length > 0 ? generateJsonSchema(value[0] as JsonValue) : { type: "string" };
    return { type: "array", items: itemSchema };
  }
  const properties: Record<string, Schema> = {};
  const required: string[] = [];
  for (const [key, v] of Object.entries(value)) {
    properties[key] = generateJsonSchema(v as JsonValue);
    required.push(key);
  }
  return { type: "object", properties, required };
}
