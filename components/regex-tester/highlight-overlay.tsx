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
  "bg-foreground/10",
  "bg-foreground/15",
  "bg-muted-foreground/20",
  "bg-foreground/[0.08]",
  "bg-muted-foreground/[0.12]",
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
  const { full, groups, groupIndices } = match;
  if (groups.length === 0 || !groupIndices) {
    return [{ kind: "outside", text: full }];
  }

  // Place capture groups by their real offsets (from the `d` flag) rather than
  // substring search, so colours stay correct when captured text recurs.
  type Span = { idx: number; start: number; end: number };
  const spans: Span[] = [];
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const off = groupIndices[i];
    if (g === undefined || g.length === 0 || off === undefined || off === null) {
      continue;
    }
    // Skip groups captured outside the match span (e.g. lookahead captures).
    if (off < 0 || off + g.length > full.length) continue;
    spans.push({ idx: i, start: off, end: off + g.length });
  }

  if (spans.length === 0) {
    return [{ kind: "outside", text: full }];
  }

  // Earliest first; on a tie prefer the longer span (outer of a nested pair).
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  const parts: MatchPart[] = [];
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue; // nested/overlapping — already covered
    if (span.start > cursor) {
      parts.push({ kind: "outside", text: full.slice(cursor, span.start) });
    }
    parts.push({
      kind: "group",
      text: full.slice(span.start, span.end),
      groupIndex: span.idx,
    });
    cursor = span.end;
  }
  if (cursor < full.length) {
    parts.push({ kind: "outside", text: full.slice(cursor) });
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
                "rounded-sm pointer-events-auto bg-foreground/15 text-foreground",
                "transition-shadow",
                isHovered && "ring-2 ring-foreground/40",
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
