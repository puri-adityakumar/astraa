export const MEMORY_PAIR_COUNT = 8;
export const MEMORY_CARD_COUNT = MEMORY_PAIR_COUNT * 2;

type MemoryPhase = "ready" | "playing" | "resolving" | "complete";
type MemoryCardState = "hidden" | "revealed" | "matched";

export interface MemoryPair {
  pairId: string;
  glyph: string;
  label: string;
}

export interface MemoryCard extends MemoryPair {
  id: string;
  state: MemoryCardState;
}

export interface MemoryState {
  cards: MemoryCard[];
  selectedIds: string[];
  moves: number;
  matches: number;
  phase: MemoryPhase;
  roundId: number;
}

export type MemoryAction =
  | { type: "start"; order: readonly string[] }
  | { type: "select"; cardId: string }
  | { type: "resolve"; roundId: number }
  | { type: "reset"; order: readonly string[] };

export type MemoryRandomSource = () => number;
