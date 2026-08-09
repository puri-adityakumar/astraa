"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
  createReadyMemoryState,
  memoryReducer,
  MEMORY_PAIRS,
  shuffleMemoryCardIds,
} from "@/lib/games/memory/engine";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { KeyboardEvent } from "react";
import type { MemoryCard, MemoryState } from "@/lib/games/memory/types";

export const MEMORY_RESOLUTION_DELAY_MS = 700;

interface MemoryClientProps {
  fixedDeckOrder?: readonly string[];
}

interface PendingResolution {
  first: MemoryCard;
  second: MemoryCard;
}

export function scheduleMemoryResolution(
  callback: () => void,
  delay = MEMORY_RESOLUTION_DELAY_MS,
): () => void {
  let active = true;
  const timeoutId = setTimeout(() => {
    if (!active) return;
    active = false;
    callback();
  }, delay);

  return () => {
    active = false;
    clearTimeout(timeoutId);
  };
}

export function MemoryClient({ fixedDeckOrder }: MemoryClientProps) {
  const [state, dispatch] = useReducer(memoryReducer, createReadyMemoryState());
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [announcement, setAnnouncement] = useState(
    "Ready. Start a new game to reveal the card grid.",
  );
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const completionHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusAfterResolutionRef = useRef<number | null>(null);
  const currentRoundIdRef = useRef(state.roundId);

  const createDeckOrder = useCallback(
    () => (fixedDeckOrder ? [...fixedDeckOrder] : shuffleMemoryCardIds(Math.random)),
    [fixedDeckOrder],
  );

  useEffect(() => {
    currentRoundIdRef.current = state.roundId;
  }, [state.roundId]);

  useEffect(() => {
    if (state.phase !== "resolving" || resetDialogOpen) return;

    const pending = readPendingResolution(state);
    if (!pending) return;

    const firstIndex = state.cards.findIndex((card) => card.id === pending.first.id);
    const isMatch = pending.first.pairId === pending.second.pairId;
    focusAfterResolutionRef.current = isMatch
      ? state.cards.findIndex(
          (card) => card.state === "hidden" && !state.selectedIds.includes(card.id),
        )
      : firstIndex;

    const roundId = state.roundId;
    return scheduleMemoryResolution(() => {
      if (currentRoundIdRef.current !== roundId) return;

      const nextFocusIndex = focusAfterResolutionRef.current;
      if (nextFocusIndex !== null && nextFocusIndex >= 0) {
        setActiveCardIndex(nextFocusIndex);
      }
      setAnnouncement(
        isMatch
          ? `${pending.first.label} matched. ${state.matches + 1} of ${MEMORY_PAIRS.length} pairs found.`
          : `${pending.first.label} and ${pending.second.label} did not match. Try again.`,
      );
      dispatch({ type: "resolve", roundId });
    });
  }, [resetDialogOpen, state]);

  useEffect(() => {
    if (state.phase === "complete") {
      completionHeadingRef.current?.focus();
      return;
    }

    if (state.phase !== "playing") return;
    const requestedIndex = focusAfterResolutionRef.current;
    if (requestedIndex === null) return;

    const nextIndex = requestedIndex >= 0 ? requestedIndex : findFirstHiddenCard(state.cards);
    focusAfterResolutionRef.current = null;
    if (nextIndex < 0) return;

    cardRefs.current[nextIndex]?.focus();
  }, [state.matches, state.phase, state.roundId, state.cards]);

  const startRound = (): void => {
    focusAfterResolutionRef.current = 0;
    setActiveCardIndex(0);
    setAnnouncement("Game started. Choose two cards to find a matching pair.");
    currentRoundIdRef.current = state.roundId + 1;
    dispatch({ type: "start", order: createDeckOrder() });
  };

  const resetRound = (): void => {
    focusAfterResolutionRef.current = 0;
    setActiveCardIndex(0);
    setResetDialogOpen(false);
    setAnnouncement("New round started. Moves and matches are reset.");
    currentRoundIdRef.current = state.roundId + 1;
    dispatch({ type: "reset", order: createDeckOrder() });
  };

  const selectCard = (card: MemoryCard, index: number): void => {
    if (state.phase !== "playing" || card.state !== "hidden") return;
    setActiveCardIndex(index);
    dispatch({ type: "select", cardId: card.id });
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const direction = getArrowDirection(event.key);
    if (direction === null) return;

    event.preventDefault();
    const nextIndex = findNextHiddenCard(state.cards, index, direction);
    if (nextIndex < 0) return;

    setActiveCardIndex(nextIndex);
    cardRefs.current[nextIndex]?.focus();
  };

  return (
    <section
      className="mx-auto max-w-2xl space-y-6 py-4 sm:space-y-8 sm:py-8"
      aria-labelledby="memory-game-title"
      data-memory-game
      data-memory-phase={state.phase}
      data-memory-round={state.roundId}
    >
      <header className="space-y-4 border-b pb-8 text-center sm:pb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Astraa / Games / Local
        </p>
        <h1 id="memory-game-title">Memory Game</h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground">
          Match eight pairs of symbols. Every card and move stays in this browser.
        </p>
      </header>

      {state.phase === "ready" ? (
        <Card className="space-y-5 p-5 text-center sm:p-8">
          <div className="space-y-2">
            <h2 className="text-2xl">Ready to play?</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Start creates a fresh shuffled 4 by 4 deck. Nothing is saved after you leave or
              refresh this page.
            </p>
          </div>
          <Button onClick={startRound}>Start game</Button>
          <p className="text-xs leading-5 text-muted-foreground">
            Use Tab to enter the board, arrow keys to move, and Enter or Space to reveal cards.
          </p>
        </Card>
      ) : (
        <Card className="space-y-5 p-3 sm:space-y-6 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2" role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">{getPoliteProgressAnnouncement(state, announcement)}</span>
              <span className="contents" aria-hidden="true">
                <Stat label="Moves" value={state.moves} />
                <Stat label="Matches" value={`${state.matches}/${MEMORY_PAIRS.length}`} />
              </span>
            </div>
            {state.phase !== "complete" && (
              <ResetControl
                needsConfirmation={state.moves > 0}
                open={resetDialogOpen}
                onOpenChange={setResetDialogOpen}
                onReset={resetRound}
              />
            )}
          </div>

          <p className="min-h-6 text-sm text-muted-foreground">{announcement}</p>

          <div
            className="grid grid-cols-4 gap-2 sm:gap-3"
            role="group"
            aria-label="Memory card grid"
            data-memory-grid
          >
            {state.cards.map((card, index) => {
              const isActionable = state.phase === "playing" && card.state === "hidden";
              return (
                <button
                  key={card.id}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  type="button"
                  className={cn(
                    "relative flex aspect-square min-h-[3.75rem] min-w-0 flex-col items-center " +
                      "justify-center gap-0.5 overflow-hidden rounded-lg border px-1 text-center " +
                      "shadow-geist focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring " +
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[5.5rem]",
                    card.state === "hidden" && "bg-muted/60 text-foreground hover:bg-muted",
                    card.state === "revealed" && "border-primary bg-primary/10 text-foreground",
                    card.state === "matched" &&
                      "border-foreground/25 bg-background-2 text-foreground",
                    "motion-safe:transition-transform motion-safe:duration-150 " +
                      "motion-safe:active:scale-[0.98] motion-safe:hover:-translate-y-0.5",
                  )}
                  aria-disabled={!isActionable}
                  aria-label={getCardAccessibleName(card, index)}
                  aria-pressed={card.state !== "hidden"}
                  data-memory-card={index + 1}
                  data-memory-card-state={card.state}
                  onClick={() => selectCard(card, index)}
                  onKeyDown={(event) => handleCardKeyDown(event, index)}
                  tabIndex={state.phase !== "complete" && activeCardIndex === index ? 0 : -1}
                >
                  {card.state === "hidden" ? (
                    <>
                      <span className="text-lg font-semibold" aria-hidden="true">
                        ?
                      </span>
                      <span className="text-[9px] font-medium uppercase tracking-wide sm:text-[10px]">
                        Hidden
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl leading-none sm:text-2xl" aria-hidden="true">
                        {card.glyph}
                      </span>
                      <span className="max-w-full truncate text-[9px] font-medium sm:text-[10px]">
                        {card.state === "matched" ? `${card.label} · Matched` : card.label}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {state.phase === "complete" && (
            <div className="space-y-4 rounded-lg border bg-muted/30 p-5 text-center">
              <div className="space-y-2">
                <h2 ref={completionHeadingRef} className="text-2xl" tabIndex={-1}>
                  All pairs matched
                </h2>
                <p className="text-sm text-muted-foreground">
                  You completed the round in {state.moves} moves.
                </p>
              </div>
              <Button onClick={resetRound}>Play again</Button>
            </div>
          )}
        </Card>
      )}
    </section>
  );
}

interface ResetControlProps {
  needsConfirmation: boolean;
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  open: boolean;
}

function ResetControl({ needsConfirmation, onOpenChange, onReset, open }: ResetControlProps) {
  if (!needsConfirmation) {
    return (
      <Button type="button" variant="outline" onClick={onReset}>
        Reset game
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline">
          Reset game
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a new round?</AlertDialogTitle>
          <AlertDialogDescription>
            Your current moves and matches will be cleared. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep playing</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>Start new round</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface StatProps {
  label: string;
  value: number | string;
}

function Stat({ label, value }: StatProps) {
  return (
    <span className="min-w-20 rounded-md border bg-background px-3 py-2 text-left">
      <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="block text-lg font-semibold leading-6">{value}</span>
    </span>
  );
}

function readPendingResolution(state: MemoryState): PendingResolution | null {
  const [firstId, secondId] = state.selectedIds;
  if (!firstId || !secondId) return null;

  const first = state.cards.find((card) => card.id === firstId);
  const second = state.cards.find((card) => card.id === secondId);
  return first && second ? { first, second } : null;
}

function getCardAccessibleName(card: MemoryCard, index: number): string {
  const position = `Card ${index + 1}`;
  if (card.state === "hidden") return `${position}, hidden`;
  return `${position}, ${card.label}, ${card.state}`;
}

function getArrowDirection(key: string): number | null {
  if (key === "ArrowLeft") return -1;
  if (key === "ArrowRight") return 1;
  if (key === "ArrowUp") return -4;
  if (key === "ArrowDown") return 4;
  return null;
}

function findFirstHiddenCard(cards: readonly MemoryCard[]): number {
  return cards.findIndex((card) => card.state === "hidden");
}

function findNextHiddenCard(
  cards: readonly MemoryCard[],
  currentIndex: number,
  direction: number,
): number {
  for (let step = 1; step <= cards.length; step += 1) {
    const candidateIndex = (currentIndex + direction * step + cards.length * step) % cards.length;
    if (cards[candidateIndex]?.state === "hidden") return candidateIndex;
  }

  return findFirstHiddenCard(cards);
}

function getPoliteProgressAnnouncement(state: MemoryState, announcement: string): string {
  const committedMoves = state.phase === "resolving" ? Math.max(0, state.moves - 1) : state.moves;
  return (
    `Game progress: ${committedMoves} moves, ${state.matches} of ${MEMORY_PAIRS.length} matches. ` +
    announcement
  );
}
