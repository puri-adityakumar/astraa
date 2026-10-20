import type { ExportSize } from "./capture";

export type { ExportSize };
export type ExportScale = 1 | 2;

export function buildExportFilename(filename: string, timestamp: number): string {
  const trimmed = filename.trim();
  const base = trimmed.length === 0 ? "snippet" : trimmed.replace(/\.[^.]+$/, "");
  const safe = base.replace(/[^a-zA-Z0-9-_]/g, "-");
  return `${safe}-${timestamp}.png`;
}

/**
 * With `size` omitted (legacy), the raster follows the node's measured
 * display bounds times the scale. With an explicit `size` (terminal), the
 * node renders at that exact size and the canvas multiplier produces the
 * requested raster, so the output never depends on the display viewport.
 */
export async function exportSnippet(
  node: HTMLElement,
  scale: ExportScale,
  size?: ExportSize | undefined,
): Promise<Blob> {
  await document.fonts.ready;
  const mod = await import("dom-to-image-more");
  const toBlob = mod.default.toBlob ?? mod.toBlob;
  const base = {
    cacheBust: true,
    quality: 1,
  };
  let blob: Blob | null;
  if (size) {
    blob = await toBlob(node, {
      ...base,
      width: size.width,
      height: size.height,
      scale,
    });
  } else {
    const { width, height } = node.getBoundingClientRect();
    blob = await toBlob(node, {
      ...base,
      width: width * scale,
      height: height * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      },
    });
  }
  if (!blob) throw new Error("Export failed: empty blob");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard API unavailable");
  }
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

export function isClipboardSupported(): boolean {
  return (
    typeof ClipboardItem !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.clipboard?.write
  );
}
