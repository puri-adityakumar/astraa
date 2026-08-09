import {
  MEMORY_CARD_COUNT,
  MEMORY_PAIR_COUNT,
  type MemoryAction,
  type MemoryCard,
  type MemoryPair,
  type MemoryRandomSource,
  type MemoryState,
} from "./types";

export const MEMORY_PAIRS: readonly MemoryPair[] = Object.freeze([
  { pairId: "circle", glyph: "●", label: "Circle" },
  { pairId: "diamond", glyph: "◆", label: "Diamond" },
  { pairId: "hexagon", glyph: "⬢", label: "Hexagon" },
  { pairId: "pentagon", glyph: "⬟", label: "Pentagon" },
  { pairId: "sparkle", glyph: "✦", label: "Sparkle" },
  { pairId: "square", glyph: "■", label: "Square" },
  { pairId: "star", glyph: "★", label: "Star" },
  { pairId: "triangle", glyph: "▲", label: "Triangle" },
]);

const CARD_DEFINITIONS: readonly MemoryCard[] = Object.freeze(
  MEMORY_PAIRS.flatMap((pair) =>
    (["a", "b"] as const).map((copy) => ({
      ...pair,
      id: `${pair.pairId}-${copy}`,
      state: "hidden" as const,
    })),
  ),
);

const CARD_BY_ID = new Map(CARD_DEFINITIONS.map((card) => [card.id, card]));

export const MEMORY_CARD_IDS: readonly string[] = Object.freeze(
  CARD_DEFINITIONS.map((card) => card.id),
);

export function createReadyMemoryState(roundId = 0): MemoryState {
  return {
    cards: [],
    selectedIds: [],
    moves: 0,
    matches: 0,
    phase: "ready",
    roundId,
  };
}

export function createMemoryDeck(order: readonly string[]): MemoryCard[] {
  assertCompleteCardOrder(order);

  return order.map((id) => ({ ...CARD_BY_ID.get(id)! }));
}

export function shuffleMemoryCardIds(random: MemoryRandomSource): string[] {
  const ids = [...MEMORY_CARD_IDS];

  for (let index = ids.length - 1; index > 0; index -= 1) {
    const sample = random();
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
      throw new RangeError("Memory shuffle values must be finite numbers from 0 up to 1.");
    }

    const swapIndex = Math.floor(sample * (index + 1));
    [ids[index], ids[swapIndex]] = [ids[swapIndex]!, ids[index]!];
  }

  return ids;
}

export function memoryReducer(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case "start":
      if (state.phase !== "ready") return state;
      return createPlayingState(action.order, state.roundId + 1);
    case "reset":
      return createPlayingState(action.order, state.roundId + 1);
    case "select":
      return selectCard(state, action.cardId);
    case "resolve":
      return resolveSelection(state, action.roundId);
  }
}

function createPlayingState(order: readonly string[], roundId: number): MemoryState {
  return {
    cards: createMemoryDeck(order),
    selectedIds: [],
    moves: 0,
    matches: 0,
    phase: "playing",
    roundId,
  };
}

function selectCard(state: MemoryState, cardId: string): MemoryState {
  if (state.phase !== "playing") return state;

  const selectedCard = state.cards.find((card) => card.id === cardId);
  if (!selectedCard || selectedCard.state !== "hidden") return state;

  const selectedIds = [...state.selectedIds, cardId];
  const cards = state.cards.map((card) =>
    card.id === cardId ? { ...card, state: "revealed" as const } : card,
  );

  if (selectedIds.length === 1) {
    return { ...state, cards, selectedIds };
  }

  return {
    ...state,
    cards,
    selectedIds,
    moves: state.moves + 1,
    phase: "resolving",
  };
}

function resolveSelection(state: MemoryState, roundId: number): MemoryState {
  if (state.phase !== "resolving" || state.roundId !== roundId) return state;

  const [firstId, secondId] = state.selectedIds;
  if (!firstId || !secondId) return state;

  const first = state.cards.find((card) => card.id === firstId);
  const second = state.cards.find((card) => card.id === secondId);
  if (!first || !second) return state;

  const isMatch = first.pairId === second.pairId;
  const matches = state.matches + (isMatch ? 1 : 0);
  const cards = state.cards.map((card) => {
    if (card.id !== firstId && card.id !== secondId) return card;
    return { ...card, state: isMatch ? ("matched" as const) : ("hidden" as const) };
  });

  return {
    ...state,
    cards,
    selectedIds: [],
    matches,
    phase: matches === MEMORY_PAIR_COUNT ? "complete" : "playing",
  };
}

function assertCompleteCardOrder(order: readonly string[]): void {
  if (order.length !== MEMORY_CARD_COUNT) {
    throw new RangeError(`Memory card order must contain ${MEMORY_CARD_COUNT} cards.`);
  }

  const uniqueIds = new Set(order);
  if (uniqueIds.size !== MEMORY_CARD_COUNT || order.some((id) => !CARD_BY_ID.has(id))) {
    throw new RangeError("Memory card order must contain every canonical card exactly once.");
  }
}
