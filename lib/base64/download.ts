export function downloadAsFile(
  content: string | Uint8Array,
  filename: string,
  mime: string,
): void {
  const blob = new Blob(
    [typeof content === "string" ? content : content as BlobPart],
    { type: mime },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
