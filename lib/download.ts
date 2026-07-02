/**
 * Shared browser-download utilities (CC-02, XD-01).
 *
 * The canonical "anchor dance": create an object URL, append a hidden anchor to
 * the body, click it, remove it, then revoke the URL on the next tick.
 *
 * NOTE: the revoke MUST be deferred (`setTimeout(..., 0)`). Revoking the object
 * URL synchronously after `click()` can abort the download on some browsers
 * (e.g. older Firefox). This is the safe variant used everywhere now.
 */

/**
 * Build a Blob from string or binary content. Split out so it is unit-testable
 * without DOM globals (vitest runs in a node environment).
 */
export function buildBlob(content: string | Uint8Array, mime: string): Blob {
  const part: BlobPart =
    typeof content === "string" ? content : (content as unknown as BlobPart);
  return new Blob([part], { type: mime });
}

/**
 * Trigger a browser download for an existing Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
}

/**
 * Build a Blob from `content` and trigger a browser download for it.
 */
export function downloadContent(
  content: string | Uint8Array,
  filename: string,
  mime: string,
): void {
  downloadBlob(buildBlob(content, mime), filename);
}
