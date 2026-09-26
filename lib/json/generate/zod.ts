import type { JsonValue } from "../types";

function pascalCase(s: string): string {
  if (!s) return "Root";
  const cleaned = s.replace(/[^A-Za-z0-9_]/g, " ");
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("") || "Root";
}

function isSafeIdentifier(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function zodOf(value: JsonValue, indent: number): string {
  const pad = "  ".repeat(indent);
  if (value === null) return "z.null()";
  if (typeof value === "string") return "z.string()";
  if (typeof value === "boolean") return "z.boolean()";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "z.number().int()" : "z.number()";
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "z.array(z.unknown())";
    return `z.array(${zodOf(value[0] as JsonValue, indent)})`;
  }
  // object
  const keys = Object.keys(value);
  if (keys.length === 0) return "z.object({})";
  const fields: string[] = [];
  for (const key of keys) {
    const safeKey = isSafeIdentifier(key) ? key : JSON.stringify(key);
    const fieldZod = zodOf((value as Record<string, JsonValue>)[key] as JsonValue, indent + 1);
    fields.push(`${pad}  ${safeKey}: ${fieldZod}`);
  }
  return `z.object({\n${fields.join(",\n")}\n${pad}})`;
}

export async function generateZod(
  jsonText: string,
  typeName: string,
): Promise<string> {
  const value = JSON.parse(jsonText) as JsonValue;
  const name = pascalCase(typeName);
  const body = zodOf(value, 0);
  return [
    `import { z } from "zod";`,
    ``,
    `export const ${name} = ${body};`,
    ``,
    `export type ${name} = z.infer<typeof ${name}>;`,
  ].join("\n");
}
