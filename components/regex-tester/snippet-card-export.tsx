"use client";

import { useCallback, useState } from "react";
import { ImageDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { getUserFriendlyError, logError } from "@/lib/error-handler";
import type { MatchResult } from "@/lib/regex-tester/types";

export interface SnippetCardExportProps {
  pattern: string;
  flags: string;
  matches: MatchResult[];
}

const CARD_WIDTH = 800;
const CARD_PADDING = 32;
const TITLE_FONT = "600 22px 'Geist Sans', 'Inter', system-ui, sans-serif";
const PATTERN_FONT = "500 20px 'Geist Mono', ui-monospace, monospace";
const MATCH_FONT = "14px 'Geist Mono', ui-monospace, monospace";
const META_FONT = "12px 'Geist Sans', system-ui, sans-serif";

const COLORS = {
  bg: "#0b0b0e",
  card: "#15161a",
  accent: "#a78bfa",
  text: "#fafafa",
  muted: "#9ca3af",
  border: "#27272a",
  matchBg: "#1f1d2b",
  matchText: "#e0e7ff",
};

function shortHash(pattern: string, flags: string): string {
  let hash = 5381;
  const input = `${pattern}/${flags}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return (hash >>> 0).toString(36).slice(0, 8);
}

function drawCard(
  pattern: string,
  flags: string,
  matches: MatchResult[],
): HTMLCanvasElement | null {
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const previewMatches = matches.slice(0, 5);
  const headerHeight = 100;
  const matchRowHeight = 28;
  const matchesHeight =
    previewMatches.length === 0 ? 36 : previewMatches.length * matchRowHeight + 24;
  const footerHeight = 32;
  const cardHeight = headerHeight + matchesHeight + footerHeight + CARD_PADDING * 2;

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * dpr;
  canvas.height = cardHeight * dpr;
  canvas.style.width = `${CARD_WIDTH}px`;
  canvas.style.height = `${cardHeight}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  // Background.
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CARD_WIDTH, cardHeight);

  // Card frame.
  ctx.fillStyle = COLORS.card;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  const innerX = CARD_PADDING / 2;
  const innerY = CARD_PADDING / 2;
  const innerW = CARD_WIDTH - CARD_PADDING;
  const innerH = cardHeight - CARD_PADDING;
  roundedRect(ctx, innerX, innerY, innerW, innerH, 14);
  ctx.fill();
  ctx.stroke();

  // Header — "Regex Tester · astraa"
  ctx.font = TITLE_FONT;
  ctx.fillStyle = COLORS.text;
  ctx.fillText("Regex Tester", CARD_PADDING, CARD_PADDING + 22);
  ctx.font = META_FONT;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText("astraa.app/tools/regex", CARD_PADDING, CARD_PADDING + 42);

  // Pattern row.
  const patternY = CARD_PADDING + 76;
  ctx.font = PATTERN_FONT;
  ctx.fillStyle = COLORS.accent;
  ctx.fillText("/", CARD_PADDING, patternY);
  ctx.fillStyle = COLORS.text;
  const patternMaxWidth = CARD_WIDTH - CARD_PADDING * 2 - 80;
  const displayedPattern = clipToWidth(ctx, pattern, patternMaxWidth);
  ctx.fillText(displayedPattern, CARD_PADDING + 14, patternY);
  const patternWidth = ctx.measureText(displayedPattern).width;
  ctx.fillStyle = COLORS.accent;
  ctx.fillText(`/${flags}`, CARD_PADDING + 14 + patternWidth + 4, patternY);

  // Matches.
  const matchesStartY = CARD_PADDING + headerHeight + 16;
  if (previewMatches.length === 0) {
    ctx.font = MATCH_FONT;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText("No matches.", CARD_PADDING, matchesStartY);
  } else {
    previewMatches.forEach((m, idx) => {
      const y = matchesStartY + idx * matchRowHeight;
      const chipHeight = 22;
      const chipY = y - chipHeight + 6;
      // index chip
      ctx.fillStyle = COLORS.matchBg;
      roundedRect(ctx, CARD_PADDING, chipY, 46, chipHeight, 4);
      ctx.fill();
      ctx.font = "11px 'Geist Mono', ui-monospace, monospace";
      ctx.fillStyle = COLORS.matchText;
      ctx.fillText(`#${idx + 1}`, CARD_PADDING + 10, chipY + 15);
      // match text
      ctx.font = MATCH_FONT;
      ctx.fillStyle = COLORS.text;
      const matchMaxWidth = CARD_WIDTH - CARD_PADDING * 2 - 60;
      const text = clipToWidth(ctx, `"${m.full}"`, matchMaxWidth);
      ctx.fillText(text, CARD_PADDING + 56, y);
    });
  }

  // Footer.
  const footerY = cardHeight - CARD_PADDING - 8;
  ctx.font = META_FONT;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(
    `${matches.length} match${matches.length === 1 ? "" : "es"} · generated locally`,
    CARD_PADDING,
    footerY,
  );
  ctx.textAlign = "right";
  ctx.fillStyle = COLORS.accent;
  ctx.fillText("astraa", CARD_WIDTH - CARD_PADDING, footerY);
  ctx.textAlign = "left";

  return canvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function clipToWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(text.slice(0, mid) + "…").width <= maxWidth) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return text.slice(0, lo) + "…";
}

export function SnippetCardExport({
  pattern,
  flags,
  matches,
}: SnippetCardExportProps) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handleExport = useCallback(async () => {
    if (pattern.length === 0) return;
    setBusy(true);
    try {
      const canvas = drawCard(pattern, flags, matches);
      if (!canvas) throw new Error("Canvas not available in this browser.");
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!blob) throw new Error("Failed to encode PNG blob.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `regex-${shortHash(pattern, flags)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast({
        title: "Snippet exported",
        description: "PNG saved to your downloads.",
      });
    } catch (error) {
      const details = getUserFriendlyError(error);
      toast({
        title: details.title,
        description: details.message,
        variant: "destructive",
      });
      logError(error, { context: "regex-tester/snippet-export" });
    } finally {
      setBusy(false);
    }
  }, [pattern, flags, matches, toast]);

  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleExport}
          disabled={busy || pattern.length === 0}
          aria-label="Export pattern as PNG"
          className="shrink-0 min-h-touch min-w-touch"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImageDown className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Export pattern as PNG</TooltipContent>
    </Tooltip>
  );
}
