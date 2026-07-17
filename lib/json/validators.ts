import { ALLOWED_MIME, MAX_DOCUMENT_BYTES } from "./defaults";
import type { ValidationResult } from "./types";

export { MAX_DOCUMENT_BYTES, ALLOWED_MIME };

export function validateFile(file: File): ValidationResult {
  const isAllowedMime =
    ALLOWED_MIME.includes(file.type as (typeof ALLOWED_MIME)[number]) ||
    file.name.toLowerCase().endsWith(".json");
  if (!isAllowedMime) {
    return { ok: false, reason: "type" };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

export { readFileAsText } from "@/lib/file-reader";
