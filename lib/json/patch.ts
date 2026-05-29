import type { JsonValue, PatchOp } from "./types";
import { parsePath } from "./paths";

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function applyPatch(
  root: JsonValue,
  path: string,
  op: PatchOp,
  value?: JsonValue,
): JsonValue {
  if (path === "" && op === "set") {
    return clone(value as JsonValue);
  }

  const segments = parsePath(path);
  const next = clone(root);

  if (op === "set" || op === "remove") {
    let target: JsonValue = next;
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i];
      if (seg === undefined) return next;
      target = (target as Record<string | number, JsonValue>)[seg] as JsonValue;
      if (target === undefined || target === null) return next;
    }
    const lastRaw = segments[segments.length - 1];
    if (lastRaw === undefined) return next;
    const last: string | number = lastRaw;
    if (op === "set") {
      (target as Record<string | number, JsonValue>)[last] = clone(value as JsonValue);
    } else if (Array.isArray(target) && typeof last === "number") {
      target.splice(last, 1);
    } else if (target && typeof target === "object") {
      delete (target as Record<string, JsonValue>)[last as string];
    }
    return next;
  }

  // op === "add"
  let target: JsonValue = next;
  for (const seg of segments) {
    if (seg === undefined) return next;
    const child = (target as Record<string | number, JsonValue>)[seg];
    if (child === undefined) {
      (target as Record<string | number, JsonValue>)[seg] = clone(value as JsonValue);
      return next;
    }
    target = child as JsonValue;
  }
  if (Array.isArray(target)) {
    target.push(clone(value as JsonValue));
  }
  return next;
}
