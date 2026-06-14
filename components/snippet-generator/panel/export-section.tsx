// components/snippet-generator/panel/export-section.tsx
"use client";

import { Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExportActions } from "@/lib/snippet-generator/use-export-actions";

type Props = {
  getNode: () => HTMLElement | null;
};

export function ExportSection({ getNode }: Props) {
  const { pending, doDownload, doCopy, clipboardSupported } = useExportActions(getNode);

  return (
    <div className="space-y-2">
      <Button
        onClick={() => doDownload(2)}
        disabled={pending !== null}
        className="w-full justify-center"
      >
        <Download className="h-4 w-4 mr-2" aria-hidden />
        {pending === "2x" ? "Exporting…" : "Download PNG 2×"}
      </Button>
      <Button
        onClick={() => doDownload(1)}
        disabled={pending !== null}
        variant="outline"
        className="w-full justify-center"
      >
        <Download className="h-4 w-4 mr-2" aria-hidden />
        {pending === "1x" ? "Exporting…" : "Download PNG 1×"}
      </Button>
      {clipboardSupported && (
        <Button
          onClick={doCopy}
          disabled={pending !== null}
          variant="ghost"
          className="w-full justify-center text-muted-foreground"
        >
          <Copy className="h-4 w-4 mr-2" aria-hidden />
          {pending === "copy" ? "Copying…" : "Copy to clipboard"}
        </Button>
      )}
    </div>
  );
}
