"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
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
import type { ExportSize } from "@/lib/snippet-generator/capture";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export type ExportPending = "1x" | "2x" | "copy" | null;

/**
 * When provided (terminal panel), it returns the canonical composition size
 * the node should render at for capture; the exporter multiplies by the
 * requested scale. When omitted (legacy page), the exporter falls back to
 * the measured display bounds times the scale.
 */
export type ExportSizeProvider = () => ExportSize | undefined;

export function useExportActions(
  getNode: () => HTMLElement | null,
  getExportSize?: ExportSizeProvider | undefined,
) {
  const [pending, setPending] = useState<ExportPending>(null);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const filename = useSnippetGenerator((s) => s.filename);
  const { toast } = useToast();

  useEffect(() => {
    setClipboardSupported(isClipboardSupported());
  }, []);

  const doDownload = async (scale: ExportScale) => {
    const node = getNode();
    if (!node) return;
    setPending(scale === 1 ? "1x" : "2x");
    try {
      await Sentry.startSpan(
        { op: "snippet.export", name: `PNG ${scale}x` },
        async () => {
          const blob = await exportSnippet(node, scale, getExportSize?.());
          downloadBlob(blob, buildExportFilename(filename, Date.now()));
        },
      );
      toast({ title: "Downloaded", description: `PNG ${scale}× saved.` });
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
          const blob = await exportSnippet(node, 2, getExportSize?.());
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

  return { pending, doDownload, doCopy, clipboardSupported };
}
