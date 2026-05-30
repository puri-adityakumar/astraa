"use client";

import { forwardRef, useMemo } from "react";
import type { MatchResult } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";

export interface HighlightOverlayProps {
  text: string;
  matches: MatchResult[];
  hoveredMatchId: number | null;
  onHoverMatch: (id: number | null) => void;
  className?: string;
}

const GROUP_COLORS = [
  "bg-emerald-500/15",
  "bg-amber-500/15",
  "bg-violet-500/15",
  "bg-sky-500/15",
  "bg-rose-500/15",
] as const;

type Segment =
  | { kind: "text"; text: string }
  | { kind: "match"; matchId: number; match: MatchResult };

function buildSegments(text: string, matches: MatchResult[]): Segment[] {
  if (matches.length === 0) {
    return [{ kind: "text", text }];
  }

  const sorted = matches
    .map((m, idx) => ({ match: m, matchId: idx }))
    .sort((a, b) => a.match.index - b.match.index);

  const segments: Segment[] = [];
  let cursor = 0;

  for (const { match, matchId } of sorted) {
    if (match.index < cursor) {
      // overlapping match (e.g. lookahead / zero-length advance) — skip
      continue;
    }
    if (match.index > cursor) {
      segments.push({ kind: "text", text: text.slice(cursor, match.index) });
    }
    if (match.length > 0) {
      segments.push({ kind: "match", matchId, match });
      cursor = match.index + match.length;
    } else {
      // zero-length match — no segment, keep cursor in place
    }
  }

  if (cursor < text.length) {
    segments.push({ kind: "text", text: text.slice(cursor) });
  }

  return segments;
}

type MatchPart =
  | { kind: "outside"; text: string }
  | { kind: "group"; text: string; groupIndex: number };

function partitionMatch(match: MatchResult): MatchPart[] {
  const { full, groups } = match;
  if (groups.length === 0) {
    return [{ kind: "outside", text: full }];
  }

  // Greedy left-to-right placement of capture groups into the full match string.
  // Each defined group occurrence is consumed once from the remaining slice.
  const parts: MatchPart[] = [];
  let remaining = full;

  while (remaining.length > 0) {
    let earliest: { idx: number; start: number; text: string } | null = null;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g === undefined || g.length === 0) continue;
      const start = remaining.indexOf(g);
      if (start === -1) continue;
      if (!earliest || start < earliest.start) {
        earliest = { idx: i, start, text: g };
      }
    }

    if (!earliest) {
      parts.push({ kind: "outside", text: remaining });
      break;
    }

    if (earliest.start > 0) {
      parts.push({
        kind: "outside",
        text: remaining.slice(0, earliest.start),
      });
    }
    parts.push({
      kind: "group",
      text: earliest.text,
      groupIndex: earliest.idx,
    });
    remaining = remaining.slice(earliest.start + earliest.text.length);
  }

  return parts;
}

export const HighlightOverlay = forwardRef<HTMLPreElement, HighlightOverlayProps>(
  function HighlightOverlay(
    { text, matches, hoveredMatchId, onHoverMatch, className },
    ref,
  ) {
    const segments = useMemo(() => buildSegments(text, matches), [text, matches]);

    return (
      <pre
        ref={ref}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 m-0 px-3 py-2 overflow-auto pointer-events-none",
          "font-mono text-sm leading-relaxed whitespace-pre-wrap break-words",
          "text-foreground select-none",
          className,
        )}
      >
        {segments.map((segment, segmentIndex) => {
          if (segment.kind === "text") {
            return <span key={`t-${segmentIndex}`}>{segment.text}</span>;
          }

          const { matchId, match } = segment;
          const isHovered = hoveredMatchId === matchId;
          const parts = partitionMatch(match);

          return (
            <mark
              key={`m-${matchId}`}
              data-match-id={matchId}
              onMouseEnter={() => onHoverMatch(matchId)}
              onMouseLeave={() => onHoverMatch(null)}
              className={cn(
                "rounded-sm pointer-events-auto bg-primary/15 text-foreground",
                "transition-shadow",
                isHovered && "ring-2 ring-primary",
              )}
            >
              {parts.map((part, partIndex) => {
                if (part.kind === "outside") {
                  return (
                    <span key={`p-${matchId}-${partIndex}`}>{part.text}</span>
                  );
                }
                const color =
                  GROUP_COLORS[part.groupIndex % GROUP_COLORS.length] ??
                  GROUP_COLORS[0];
                return (
                  <span
                    key={`p-${matchId}-${partIndex}`}
                    className={cn("rounded-sm text-foreground", color)}
                  >
                    {part.text}
                  </span>
                );
              })}
            </mark>
          );
        })}
        {/* Trailing newline so the overlay matches textarea height when text ends with \n */}
        {text.endsWith("\n") ? <span>{"​"}</span> : null}
      </pre>
    );
  },
);
