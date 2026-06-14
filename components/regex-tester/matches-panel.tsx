"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { matchesToCsv, matchesToJson } from "@/lib/regex-tester/export";
import type { MatchResult } from "@/lib/regex-tester/types";

export interface MatchesPanelProps {
  matches: MatchResult[];
  hoveredMatchId: number | null;
  onHoverMatch: (id: number | null) => void;
  onJumpToMatch: (matchId: number) => void;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function MatchesPanel({
  matches,
  hoveredMatchId,
  onHoverMatch,
  onJumpToMatch,
}: MatchesPanelProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hoveredMatchId === null) return;
    const row = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-match-id="${hoveredMatchId}"]`,
    );
    row?.scrollIntoView({ block: "nearest" });
  }, [hoveredMatchId]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") {
        return;
      }
      e.preventDefault();
      const focused = document.activeElement as HTMLElement | null;
      const focusedId =
        focused?.dataset.matchId !== undefined
          ? Number(focused.dataset.matchId)
          : null;
      if (e.key === "Enter" && focusedId !== null) {
        onJumpToMatch(focusedId);
        return;
      }
      const direction = e.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        focusedId === null
          ? direction === 1
            ? 0
            : matches.length - 1
          : Math.min(matches.length - 1, Math.max(0, focusedId + direction));
      const nextRow = listRef.current?.querySelector<HTMLButtonElement>(
        `[data-match-id="${nextIndex}"]`,
      );
      nextRow?.focus();
      onHoverMatch(nextIndex);
    },
    [matches.length, onHoverMatch, onJumpToMatch],
  );

  if (matches.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Matches</p>
        <p className="text-sm italic text-muted-foreground">
          No matches yet &mdash; try a starter pattern below.
        </p>
      </div>
    );
  }

  const handleExportJson = () =>
    downloadBlob(matchesToJson(matches), "regex-matches.json", "application/json");
  const handleExportCsv = () =>
    downloadBlob(matchesToCsv(matches), "regex-matches.csv", "text/csv");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Matches{" "}
          <span className="text-muted-foreground tabular-nums">
            ({matches.length})
          </span>
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="Export matches"
              className="min-h-touch"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleExportJson}>
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportCsv}>
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={listRef}
        role="listbox"
        aria-label="Regex matches"
        tabIndex={matches.length > 0 ? 0 : -1}
        onKeyDown={handleKeyDown}
        className={cn(
          "max-h-48 overflow-y-auto rounded-md border border-border",
          "bg-muted/30",
          "focus-within:ring-2 focus-within:ring-ring",
          "focus-within:ring-offset-2 focus-within:ring-offset-background",
        )}
      >
        {matches.map((match, matchId) => {
          const isHovered = hoveredMatchId === matchId;
          return (
            <button
              key={matchId}
              type="button"
              role="option"
              aria-selected={isHovered}
              data-match-id={matchId}
              onMouseEnter={() => onHoverMatch(matchId)}
              onMouseLeave={() => onHoverMatch(null)}
              onFocus={() => onHoverMatch(matchId)}
              onClick={() => onJumpToMatch(matchId)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs font-mono",
                "border-b border-border/60 last:border-b-0",
                "hover:bg-muted/60",
                "focus:outline-none focus:bg-muted",
                "transition-colors duration-100 ease-out",
                isHovered && "bg-muted/60",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-muted-foreground tabular-nums">
                  #{matchId + 1}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  idx {match.index}
                </span>
                <span className="text-foreground truncate max-w-[50%] sm:max-w-none">
                  &quot;{truncate(match.full, 40)}&quot;
                </span>
              </div>
              {(match.groups.length > 0 ||
                Object.keys(match.namedGroups).length > 0) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                  {match.groups.map((group, groupIdx) => (
                    <span
                      key={`g${groupIdx}`}
                      className={cn(
                        "rounded bg-background/60 px-1.5 py-0.5",
                        "border border-border/60 text-muted-foreground",
                      )}
                    >
                      g{groupIdx + 1}:{" "}
                      <span className="text-foreground">
                        {group === undefined
                          ? "—"
                          : `"${truncate(group, 16)}"`}
                      </span>
                    </span>
                  ))}
                  {Object.entries(match.namedGroups).map(([name, value]) => (
                    <span
                      key={`n${name}`}
                      className={cn(
                        "rounded bg-background/60 px-1.5 py-0.5",
                        "border border-border/60 text-muted-foreground",
                      )}
                    >
                      {name}:{" "}
                      <span className="text-foreground">
                        {value === undefined
                          ? "—"
                          : `"${truncate(value, 16)}"`}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
