"use client";

import { ChevronDown, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExportActions } from "@/lib/snippet-generator/use-export-actions";

type Props = {
  getNode: () => HTMLElement | null;
};

export function TopExport({ getNode }: Props) {
  const { pending, doDownload, doCopy, clipboardSupported } = useExportActions(getNode);
  const busy = pending !== null;

  return (
    <div className="inline-flex rounded-md shadow-sm">
      <Button
        onClick={() => doDownload(2)}
        disabled={busy}
        className="rounded-r-none border-r border-primary-foreground/20"
      >
        <Download className="h-4 w-4 mr-2" aria-hidden />
        {pending === "2x" ? "Exporting…" : "Export PNG 2×"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={busy}
            className="rounded-l-none px-2"
            aria-label="More export options"
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => doDownload(2)} disabled={busy}>
            <Download className="h-4 w-4 mr-2" aria-hidden />
            Download PNG 2×
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => doDownload(1)} disabled={busy}>
            <Download className="h-4 w-4 mr-2" aria-hidden />
            Download PNG 1×
          </DropdownMenuItem>
          {clipboardSupported && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={doCopy} disabled={busy}>
                <Copy className="h-4 w-4 mr-2" aria-hidden />
                Copy to clipboard
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
