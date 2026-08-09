import { describe, expect, it, vi } from "vitest";

import {
  createMemoryDeck,
  createReadyMemoryState,
  memoryReducer,
  MEMORY_CARD_IDS,
  MEMORY_PAIRS,
  shuffleMemoryCardIds,
} from "./engine";
import { MEMORY_CARD_COUNT, MEMORY_PAIR_COUNT, type MemoryState } from "./types";

const ORDER = [
  "circle-a",
  "diamond-a",
  "circle-b",
  "diamond-b",
  "hexagon-a",
  "hexagon-b",
  "pentagon-a",
  "pentagon-b",
  "sparkle-a",
  "sparkle-b",
  "square-a",
  "square-b",
  "star-a",
  "star-b",
  "triangle-a",
  "triangle-b",
] as const;

function startRound(state = createReadyMemoryState()): MemoryState {
  return memoryReducer(state, { type: "start", order: ORDER });
}

function selectPair(state: MemoryState, firstId: string, secondId: string): MemoryState {
  const afterFirst = memoryReducer(state, { type: "select", cardId: firstId });
  return memoryReducer(afterFirst, { type: "select", cardId: secondId });
}

function resolveRound(state: MemoryState): MemoryState {
  return memoryReducer(state, { type: "resolve", roundId: state.roundId });
}

describe("Memory deck", () => {
  it("keeps the ready state stable, empty, and unrandomized", () => {
    expect(createReadyMemoryState()).toEqual(createReadyMemoryState());
    expect(createReadyMemoryState()).toEqual({
      cards: [],
      selectedIds: [],
      moves: 0,
      matches: 0,
      phase: "ready",
      roundId: 0,
    });
  });

  it("defines eight uniquely labelled neutral pairs and sixteen stable IDs", () => {
    expect(MEMORY_PAIRS).toHaveLength(MEMORY_PAIR_COUNT);
    expect(new Set(MEMORY_PAIRS.map((pair) => pair.pairId))).toHaveLength(MEMORY_PAIR_COUNT);
    expect(new Set(MEMORY_PAIRS.map((pair) => pair.label))).toHaveLength(MEMORY_PAIR_COUNT);
    expect(new Set(MEMORY_PAIRS.map((pair) => pair.glyph))).toHaveLength(MEMORY_PAIR_COUNT);
    expect(MEMORY_CARD_IDS).toHaveLength(MEMORY_CARD_COUNT);
    expect(new Set(MEMORY_CARD_IDS)).toHaveLength(MEMORY_CARD_COUNT);
  });

  it("creates exactly two hidden cards for every pair", () => {
    const deck = createMemoryDeck(MEMORY_CARD_IDS);

    expect(deck).toHaveLength(MEMORY_CARD_COUNT);
    expect(deck.every((card) => card.state === "hidden")).toBe(true);
    for (const pair of MEMORY_PAIRS) {
      expect(deck.filter((card) => card.pairId === pair.pairId)).toHaveLength(2);
    }
  });

  it("uses only the injected random source for a deterministic Fisher-Yates shuffle", () => {
    const random = vi.fn(() => 0);

    expect(shuffleMemoryCardIds(random)).toEqual([...MEMORY_CARD_IDS.slice(1), MEMORY_CARD_IDS[0]]);
    expect(random).toHaveBeenCalledTimes(MEMORY_CARD_COUNT - 1);
  });

  it.each([-0.01, 1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the invalid injected shuffle value %s",
    (sample) => {
      expect(() => shuffleMemoryCardIds(() => sample)).toThrow(RangeError);
    },
  );

  it("rejects incomplete, duplicate, and unknown card orders", () => {
    expect(() => createMemoryDeck(ORDER.slice(1))).toThrow(RangeError);
    expect(() => createMemoryDeck([...ORDER.slice(1), ORDER[1]!])).toThrow(RangeError);
    expect(() => createMemoryDeck([...ORDER.slice(1), "unknown-a"])).toThrow(RangeError);
  });
});

describe("Memory reducer", () => {
  it("starts only from ready with a clean incremented round", () => {
    const started = startRound(createReadyMemoryState(4));

    expect(started).toMatchObject({
      matches: 0,
      moves: 0,
      phase: "playing",
      roundId: 5,
      selectedIds: [],
    });
    expect(memoryReducer(started, { type: "start", order: [...ORDER].reverse() })).toBe(started);
  });

  it("reveals one hidden card without incrementing a move", () => {
    const started = startRound();
    const selected = memoryReducer(started, { type: "select", cardId: "circle-a" });

    expect(selected.phase).toBe("playing");
    expect(selected.moves).toBe(0);
    expect(selected.selectedIds).toEqual(["circle-a"]);
    expect(selected.cards.find((card) => card.id === "circle-a")?.state).toBe("revealed");
  });

  it("reveals a second card, increments one move, and resolves atomically", () => {
    const resolving = selectPair(startRound(), "circle-a", "circle-b");

    expect(resolving).toMatchObject({ moves: 1, phase: "resolving" });
    expect(resolving.selectedIds).toEqual(["circle-a", "circle-b"]);
    const resolved = resolveRound(resolving);
    expect(resolved).toMatchObject({ matches: 1, moves: 1, phase: "playing" });
    expect(resolved.selectedIds).toEqual([]);
    expect(
      resolved.cards
        .filter((card) => card.pairId === "circle")
        .every((card) => card.state === "matched"),
    ).toBe(true);
  });

  it("hides a mismatch without changing the match count", () => {
    const resolving = selectPair(startRound(), "circle-a", "diamond-a");
    const resolved = resolveRound(resolving);

    expect(resolved).toMatchObject({ matches: 0, moves: 1, phase: "playing" });
    expect(
      resolved.cards
        .filter((card) => ["circle-a", "diamond-a"].includes(card.id))
        .every((card) => card.state === "hidden"),
    ).toBe(true);
  });

  it("ignores same-card, unknown-card, revealed, and matched selections", () => {
    const started = startRound();
    const selected = memoryReducer(started, { type: "select", cardId: "circle-a" });

    expect(memoryReducer(selected, { type: "select", cardId: "circle-a" })).toBe(selected);
    expect(memoryReducer(selected, { type: "select", cardId: "unknown-a" })).toBe(selected);

    const matched = resolveRound(memoryReducer(selected, { type: "select", cardId: "circle-b" }));
    expect(memoryReducer(matched, { type: "select", cardId: "circle-a" })).toBe(matched);
  });

  it("ignores rapid third-card input while resolving", () => {
    const resolving = selectPair(startRound(), "circle-a", "diamond-a");

    expect(memoryReducer(resolving, { type: "select", cardId: "hexagon-a" })).toBe(resolving);
  });

  it("increments moves per attempt and matches only per successful pair", () => {
    let state = startRound();
    state = resolveRound(selectPair(state, "circle-a", "diamond-a"));
    state = resolveRound(selectPair(state, "circle-a", "circle-b"));

    expect(state).toMatchObject({ matches: 1, moves: 2 });
  });

  it.each([
    ["matching", "circle-a", "circle-b"],
    ["mismatching", "circle-a", "diamond-a"],
  ])("resets during a %s resolution into a clean new round", (_kind, firstId, secondId) => {
    const resolving = selectPair(startRound(), firstId, secondId);
    const reset = memoryReducer(resolving, { type: "reset", order: [...ORDER].reverse() });

    expect(reset).toMatchObject({
      matches: 0,
      moves: 0,
      phase: "playing",
      roundId: resolving.roundId + 1,
      selectedIds: [],
    });
    expect(reset.cards.map((card) => card.id)).toEqual([...ORDER].reverse());
  });

  it("ignores stale and duplicate resolves from an old or inactive round", () => {
    const resolving = selectPair(startRound(), "circle-a", "diamond-a");
    const reset = memoryReducer(resolving, { type: "reset", order: ORDER });

    expect(memoryReducer(reset, { type: "resolve", roundId: resolving.roundId })).toBe(reset);
    expect(memoryReducer(reset, { type: "resolve", roundId: reset.roundId })).toBe(reset);
  });

  it("completes on the final pair exactly once", () => {
    let state = startRound();
    for (const pair of MEMORY_PAIRS.slice(0, -1)) {
      state = resolveRound(selectPair(state, `${pair.pairId}-a`, `${pair.pairId}-b`));
    }

    const finalPair = MEMORY_PAIRS.at(-1)!;
    const resolving = selectPair(state, `${finalPair.pairId}-a`, `${finalPair.pairId}-b`);
    const complete = resolveRound(resolving);

    expect(complete).toMatchObject({
      matches: MEMORY_PAIR_COUNT,
      moves: MEMORY_PAIR_COUNT,
      phase: "complete",
    });
    expect(memoryReducer(complete, { type: "resolve", roundId: complete.roundId })).toBe(complete);
    expect(memoryReducer(complete, { type: "select", cardId: "circle-a" })).toBe(complete);
  });

  it("resets a completed game into a clean shuffled round", () => {
    let state = startRound();
    for (const pair of MEMORY_PAIRS) {
      state = resolveRound(selectPair(state, `${pair.pairId}-a`, `${pair.pairId}-b`));
    }

    const reset = memoryReducer(state, { type: "reset", order: [...ORDER].reverse() });
    expect(reset).toMatchObject({ matches: 0, moves: 0, phase: "playing" });
    expect(reset.roundId).toBe(state.roundId + 1);
    expect(reset.cards.every((card) => card.state === "hidden")).toBe(true);
  });
});
