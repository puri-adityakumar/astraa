/**
 * Shared byte-formatting + file-size-limit registry (XD-04, CC-04, LT-07).
 */

/**
 * Human-readable byte size with binary (1024) units.
 *
 * Supports B/KB/MB/GB/TB. Non-finite or non-positive input returns "0 Bytes".
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(decimals))} ${sizes[idx]}`;
}
