// components/snippet-generator/panel/export-section.tsx
"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { logError, getUserFriendlyError } from "@/lib/error-handler";
import {
  exportSnippet,
  downloadBlob,
  copyBlobToClipboard,
  buildExportFilename,
  isClipboardSupported,
  type ExportScale,
} from "@/lib/snippet-generator/export";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

type Props = {
  getNode: () => HTMLElement | null;
};

export function ExportSection({ getNode }: Props) {
  const [pending, setPending] = useState<"1x" | "2x" | "copy" | null>(null);
  const filename = useSnippetGenerator((s) => s.filename);
  const { toast } = useToast();
  const clipboardSupported = isClipboardSupported();

  const doDownload = async (scale: ExportScale) => {
    const node = getNode();
    if (!node) return;
    setPending(scale === 1 ? "1x" : "2x");
    try {
      await Sentry.startSpan(
        { op: "snippet.export", name: `PNG ${scale}x` },
        async () => {
          const blob = await exportSnippet(node, scale);
          downloadBlob(blob, buildExportFilename(filename, Date.now()));
        },
      );
      toast({ title: "Downloaded", description: `PNG ${scale}x saved.` });
    } catch (e) {
      const details = getUserFriendlyError(e);
      toast({
        title: details.title,
        description: details.message,
        variant: "destructive",
      });
      logError(e, { context: "snippet-generator/export-download" });
    } finally {
      setPending(null);
    }
  };

  const doCopy = async () => {
    const node = getNode();
    if (!node) return;
    setPending("copy");
    try {
      await Sentry.startSpan(
        { op: "snippet.export", name: "Copy clipboard" },
        async () => {
          const blob = await exportSnippet(node, 2);
          await copyBlobToClipboard(blob);
        },
      );
      toast({ title: "Copied", description: "PNG copied to clipboard." });
    } catch (e) {
      const details = getUserFriendlyError(e);
      toast({
        title: details.title,
        description: details.message,
        variant: "destructive",
      });
      logError(e, { context: "snippet-generator/export-clipboard" });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-2">
      <Button onClick={() => doDownload(1)} disabled={pending !== null} className="w-full">
        {pending === "1x" ? "Exporting…" : "Download PNG 1×"}
      </Button>
      <Button onClick={() => doDownload(2)} disabled={pending !== null} className="w-full">
        {pending === "2x" ? "Exporting…" : "Download PNG 2×"}
      </Button>
      {clipboardSupported && (
        <Button
          onClick={doCopy}
          disabled={pending !== null}
          variant="secondary"
          className="w-full"
        >
          {pending === "copy" ? "Copying…" : "Copy to clipboard"}
        </Button>
      )}
    </div>
  );
}
