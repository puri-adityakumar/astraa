import type { JsonValue } from "../types";

export type YamlResult =
  | { ok: true; value: JsonValue }
  | { ok: false; error: string };

export async function jsonToYaml(value: JsonValue): Promise<string> {
  const yaml = await import("js-yaml");
  return yaml.dump(value, { indent: 2, lineWidth: 100, schema: yaml.JSON_SCHEMA });
}

export async function yamlToJson(text: string): Promise<YamlResult> {
  try {
    const yaml = await import("js-yaml");
    // JSON_SCHEMA restricts types to JSON primitives — no custom JS objects, no functions.
    const value = yaml.load(text, { schema: yaml.JSON_SCHEMA }) as JsonValue;
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
