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

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FileReader returned non-string"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsText(file);
  });
}
