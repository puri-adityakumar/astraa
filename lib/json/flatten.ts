import type { JsonType, JsonValue, TreeRow } from "./types";
import { joinPath } from "./paths";

function typeOf(v: JsonValue): JsonType {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v as JsonType;
}

function previewOf(v: JsonValue): string {
  if (v === null) return "null";
  if (typeof v === "string") {
    const truncated = v.length > 48 ? v.slice(0, 48) + "…" : v;
    return JSON.stringify(truncated);
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.length}]`;
  return `{${Object.keys(v).length}}`;
}

export function flatten(value: JsonValue, expanded: Set<string>): TreeRow[] {
  const rows: TreeRow[] = [];

  function visit(v: JsonValue, path: string, key: string | number, depth: number) {
    const type = typeOf(v);
    const hasChildren =
      (type === "object" && Object.keys(v as Record<string, JsonValue>).length > 0) ||
      (type === "array" && (v as JsonValue[]).length > 0);
    const isExpanded = expanded.has(path);
    const childCount = hasChildren
      ? type === "array"
        ? (v as JsonValue[]).length
        : Object.keys(v as Record<string, JsonValue>).length
      : undefined;

    rows.push({
      path,
      key,
      depth,
      type,
      preview: previewOf(v),
      hasChildren,
      isExpanded,
      ...(childCount !== undefined ? { childCount } : {}),
    });

    if (hasChildren && isExpanded) {
      if (type === "array") {
        (v as JsonValue[]).forEach((child, i) => {
          visit(child, joinPath(path, i), i, depth + 1);
        });
      } else {
        for (const k of Object.keys(v as Record<string, JsonValue>)) {
          visit(
            (v as Record<string, JsonValue>)[k] as JsonValue,
            joinPath(path, k),
            k,
            depth + 1,
          );
        }
      }
    }
  }

  visit(value, "", "root", 0);
  return rows;
}
