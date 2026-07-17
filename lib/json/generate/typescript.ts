import type { JsonValue } from "../types";
import { pascalCase, isSafeIdentifier } from "../identifier";

function tsType(value: JsonValue, name: string, interfaces: Map<string, string>): string {
  if (value === null) return "null";
  if (typeof value === "string") return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]";
    const elem = tsType(value[0] as JsonValue, `${name}Item`, interfaces);
    return elem.includes(" | ") ? `Array<${elem}>` : `${elem}[]`;
  }
  // object
  const ifName = pascalCase(name);
  const lines: string[] = [];
  for (const [key, v] of Object.entries(value)) {
    const fieldType = tsType(v as JsonValue, `${ifName}${pascalCase(key)}`, interfaces);
    const safeKey = isSafeIdentifier(key) ? key : JSON.stringify(key);
    lines.push(`  ${safeKey}: ${fieldType};`);
  }
  const body = `export interface ${ifName} {\n${lines.join("\n")}\n}`;
  interfaces.set(ifName, body);
  return ifName;
}

export async function generateTypeScript(jsonText: string, typeName: string): Promise<string> {
  const value = JSON.parse(jsonText) as JsonValue;
  const interfaces = new Map<string, string>();
  const rootType = tsType(value, typeName, interfaces);
  if (interfaces.size === 0) {
    return `export type ${pascalCase(typeName)} = ${rootType};`;
  }
  const ordered = Array.from(interfaces.values()).reverse();
  if (rootType !== pascalCase(typeName) && !interfaces.has(pascalCase(typeName))) {
    return [...ordered, `export type ${pascalCase(typeName)} = ${rootType};`].join("\n\n");
  }
  return ordered.join("\n\n");
}
