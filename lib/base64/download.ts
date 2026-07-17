/**
 * Thin re-export so existing `downloadAsFile` callers (via `@/lib/base64`) keep
 * working while delegating to the shared download util.
 */
export { downloadContent as downloadAsFile } from "@/lib/download";
