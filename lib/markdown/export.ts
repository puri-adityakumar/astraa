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

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function exportAsMarkdown(name: string, content: string): void {
  downloadBlob(new Blob([content], { type: "text/markdown" }), `${stripExt(name)}.md`);
}

const buildStandaloneHtml = (name: string, body: string): string => `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>${escapeHtml(stripExt(name))}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:760px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#111;background:#fff;}
pre{background:#f5f5f5;padding:1rem;border-radius:6px;overflow:auto;}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
img{max-width:100%;}
table{border-collapse:collapse;}th,td{border:1px solid #ddd;padding:.4rem .6rem;}
@media print{body{margin:0;}}
</style>
</head><body>${body}</body></html>`;

export function exportAsHtml(name: string, renderedNode: HTMLElement | null): void {
  const body = renderedNode?.innerHTML ?? "";
  downloadBlob(
    new Blob([buildStandaloneHtml(name, body)], { type: "text/html" }),
    `${stripExt(name)}.html`,
  );
}

export function exportAsPdf(name: string, renderedNode: HTMLElement | null): void {
  const body = renderedNode?.innerHTML ?? "";
  const html = buildStandaloneHtml(name, body);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;
  iframe.addEventListener("load", () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } finally {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          iframe.remove();
        }, 1000);
      }
    }, 100);
  });
  document.body.appendChild(iframe);
}
