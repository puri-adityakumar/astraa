const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const stripExt = (name: string): string => {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
};

export function exportAsMarkdown(name: string, content: string): void {
  downloadBlob(new Blob([content], { type: "text/markdown" }), `${stripExt(name)}.md`);
}

export function exportAsHtml(name: string, renderedNode: HTMLElement | null): void {
  const body = renderedNode?.innerHTML ?? "";
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>${stripExt(name)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.6;}pre{background:#f5f5f5;padding:1rem;border-radius:6px;overflow:auto;}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}img{max-width:100%;}</style>
</head><body>${body}</body></html>`;
  downloadBlob(new Blob([html], { type: "text/html" }), `${stripExt(name)}.html`);
}

export function exportAsPdf(): void {
  window.print();
}
