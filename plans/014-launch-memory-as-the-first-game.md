# Plan 014: Launch Memory as Astraa's accessible first game

> **Executor instructions**: Replace the hidden Memory prototype with a pure,
> deterministic engine and accessible 4×4 UI. Do not incrementally patch its
> stale timeout model. Flip registry/indexing state only after logic, keyboard,
> screen-reader, mobile, and reduced-motion tests pass. Update
> `plans/README.md` after every first-game launch condition is verified.
>
> **Drift check (run first)**:
> `git diff --stat 94a1b1f -- app/games components/games/memory-client.tsx lib/games lib/seo/site.ts components/explore components/home knip.jsonc tests/e2e docs`
> `git status --short -- app/games components/games/memory-client.tsx lib/games lib/seo/site.ts components/explore components/home knip.jsonc tests/e2e docs`
> This plan assumes Plans 001–013 are complete. Compare the facts below with the
> live worktree and STOP on unexplained route, copy, registry, or test drift.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: Plans 008–013
- **Category**: direction
- **Planned at**: commit `94a1b1f`, 2026-08-09

## Why this matters

Astraa currently advertises seven planned games but has zero playable games and
deliberately keeps the entire games surface noindex. Memory is the smallest
candidate that can validate whether a focused break/reset experience belongs in
the product without external assets, provider dependencies, or a large engine.
The existing prototype is not launchable: it creates four identical copies of
some symbols and lets old timers overwrite a reset game. A clean state machine
and accessible grid make the launch safe and testable.

## Current state

- `lib/games/memory/useMemoryGame.ts:6` contains duplicate 🎪 and 🎯 values
  before duplicating the whole list, so the deck has four visually identical
  cards for those symbols instead of eight unique pairs.
- `useMemoryGame.ts:49-84` schedules untracked timeout callbacks over an old
  `cards` snapshot. `resetGame()` at lines 88-95 does not cancel them, so an old
  resolution can restore stale cards/matches after reset.
- `components/games/memory-client.tsx:15-71` is hidden inside `WorkInProgress`,
  uses unnamed card/reset buttons, has hover/tap motion without reduced-motion
  handling, and has no keyboard grid model, live game state, or completion focus.
- `app/games/memory/page.tsx:4-17` is accurate WIP/noindex metadata and renders no game.
- `lib/games.ts:48-55` marks Memory `coming-soon`/`local`.
- `lib/seo/site.ts:8-11` deliberately requires both an available game and
  `GAMES_INDEXING_ENABLED = true` before `/games` and game routes enter the
  sitemap. `lib/seo/site.test.ts:17-19` catches a status-only launch.
- `/games` and `/explore` currently say no games are playable and count all
  games as planned. Plan 010 made that copy route-specific and truthful.
- After Plan 013, Memory should be the only remaining hidden WIP implementation
  and Knip exemption.

## Bounded first-game contract

**Include**:

- one self-contained 4×4 deck with eight unique symbol pairs;
- hydration-safe ready state, explicit randomized Start/New game, moves,
  matched-pair count, completion state, reset/restart;
- mouse, touch, Tab, Enter/Space, and arrow-key grid navigation;
- named face-down/revealed/matched cards, polite move/match updates, completion
  focus/announcement;
- 44 px minimum targets, 320 px layout, light/dark, reduced-motion-safe reveal;
- entirely local runtime with no persistence, external asset, or network request.

**Exclude**:

- countdown/stopwatch, difficulty modes, themes, accounts, saved progress,
  daily challenge, leaderboard, sharing, sounds, confetti, analytics event
  collection, or additional games.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Engine tests | `npm test -- lib/games/memory` | all deterministic state cases pass |
| Full quality | `npm run check` | exit 0; no Memory Knip exception |
| Production artifact | `npm run build:e2e -- --webpack` | `/games` and `/games/memory` build indexable |
| Memory browser tests | `npm run test:e2e -- --grep "Memory|memory|first game"` | interaction/SEO/a11y pass |
| Full browser suite | `npm run test:e2e` | all projects pass |

## Suggested executor toolkit

- Load all three `astraa-*` skills.
- Use Vitest fake timers only at the UI/effect boundary. Keep engine tests pure
  and synchronous with injected shuffle input.

## Scope

**In scope**:

- `app/games/memory/page.tsx`
- replace `components/games/memory-client.tsx`; add focused memory components if needed
- replace `lib/games/memory/**` with engine/types/tests
- `lib/games.ts`, registry tests
- `lib/seo/site.ts`, `lib/seo/site.test.ts`, sitemap expectations
- `app/games/page.tsx`, `components/games/games-client.tsx`
- `app/explore/page.tsx`, `components/explore/explore-client.tsx`
- homepage catalog/count copy only if required by registry-derived first-game state
- `knip.jsonc`
- relevant `tests/e2e/**`
- factual `docs/ARCHITECTURE.md`/public docs updates only if game architecture changes

**Out of scope**:

- Implementing or deleting Snake, Dino, Pacman, Sudoku, Word Search, 2048, or Music routes.
- A second game launch or change to their `coming-soon` status.
- New telemetry solely to justify future games.
- External assets, copied game art, branded characters, audio, or provider calls.
- Updating the Notion Roadmap without operator authorization.
- Reusing the current state hook or UI merely to reduce diff size.

## Git workflow

- Suggested branch: `codex/014-memory-game`
- Suggested commits:
  `test(memory): define deterministic game engine` and
  `feat(memory): launch accessible first game`.
- Do not push, deploy, or open a PR unless asked.

## Steps

### Step 1: Define a pure engine and invariants

Create a framework-free engine under `lib/games/memory/`. A recommended shape:

```text
MemoryState = cards + selectedIds + moves + matches + phase + roundId
phase = ready | playing | resolving | complete
actions = start | select | resolve | reset
```

Each card needs a stable unique ID, pair ID, human-readable label, decorative
glyph, and explicit hidden/revealed/matched state. Create the deck from exactly
eight unique neutral Unicode symbols with explicit English labels, duplicate
each once, and shuffle through an injected random function or injected
deterministic order. Accessible names use the labels rather than depending on
platform-specific emoji pronunciation. Randomness is injected only when Start
or confirmed Reset runs in the browser; tests never depend on chance.

The reducer must be atomic:

- `ready` has no randomized deck and is identical in server and first client render;
- `start` creates the injected shuffled deck and enters playing;
- ignore matched/revealed selection and all selection while resolving/complete;
- first selection reveals one;
- second selection reveals it, increments one move, and enters resolving;
- `resolve` matches the pair or hides both, clears selection, and either resumes
  play or completes;
- `reset` creates a new `roundId` and initial state;
- a stale `resolve` for an old round is ignored.

Do not call `Math.random`, `crypto`, current time, or another nondeterministic
source during component initialization/render. The first server and client trees
must both be the same `ready` shell; randomize only after a user action.

**Verify**: pure tests prove the stable ready state, 16 unique IDs, exactly two
of every pair, eight unique pairs, deterministic shuffle, valid phase
transitions, and invariant preservation after every action.

### Step 2: Prove stale-timer and final-pair behavior

Add tests for:

- reset during a matching resolution;
- reset during a mismatching resolution;
- stale old-round `resolve` after reset;
- rapid third-card selection while resolving;
- same-card double selection;
- final matching pair transitions to complete exactly once;
- moves increment once per pair attempt; matches once per successful pair;
- a reset after completion returns a clean shuffled game.

The reducer must not create timers or call React/browser APIs.

**Verify**: `npm test -- lib/games/memory` passes without real-time sleeps.

### Step 3: Build one cancellable UI resolution boundary

In the client, schedule at most one resolution timeout when state enters
`resolving`. Store/capture the round ID, dispatch the corresponding resolve
action, and clear the timeout on reset, phase change, and unmount. Do not close
over and write an old deck snapshot.

Use a short fixed reveal period that lets users perceive the second card. Under
reduced motion, remove flip/scale choreography but retain the same logical
period unless testing shows it harms accessibility.

For browser determinism, let the Server Component read the existing server-only
`ASTRAA_E2E_FIXTURES` build variable and pass a fixed deck order prop only in the
E2E artifact. Production passes no fixture and the client uses injected runtime
randomness after Start. Do not add a `NEXT_PUBLIC_` test flag, query parameter,
hidden control, or production debug API.

**Verify**: component tests with fake timers unmount/reset during both resolution
types and observe no stale state update or React warning.

### Step 4: Build an accessible responsive card grid

Render a semantic labelled game region and 4×4 grid of native buttons. Requirements:

- every card has a stable position label (“Card 5, hidden”), then identifies its
  symbol/state when revealed/matched;
- reveal/selected state is programmatic, not color alone;
- arrow keys move in a roving 4-column model without trapping Tab; Home/End are optional;
- Enter/Space activates the focused card; pointer/touch use the same action;
- matched/non-actionable cards expose their state and are skipped consistently;
- every target is >=44 px and the complete grid fits at 320 px without page overflow;
- focus returns predictably after mismatch resolution; completion moves focus to
  the completion heading or Restart action;
- visible Moves and Matches have a polite, non-noisy status; completion is announced;
- decorative symbols are not the only state cue;
- reveal motion uses existing tokens/hooks and has a complete static reduced-motion state.

Use `cn()` and existing Card/Button/AlertDialog primitives. Avoid Framer Motion
unless a tiny reduced-motion-aware use is materially clearer than CSS.

**Verify**: keyboard-only Playwright can complete a deterministic fixture game,
axe has no serious/critical issues, and 320/390 px have no clipping/overflow.

### Step 5: Gate reset when it would discard progress

If moves > 0 and the game is not complete, Reset is destructive to current
progress. Use the existing AlertDialog to confirm. A completed game's “Play
again” can reset directly. The reset button needs a literal accessible name and
focus must return to a sensible first card after confirmation.

Do not persist state, scores, or high scores.

**Verify**: cancel preserves the exact state; confirm creates a new round; no old
timer changes it afterward.

### Step 6: Perform one atomic first-game route, registry, and indexing launch

Only begin this step after Steps 1–5 pass their prelaunch unit/component tests.
Apply the route, registry, indexing, sitemap, catalog copy, and Knip changes as
one launch change set. Do not run the full repository gate with Memory marked
available while `GAMES_INDEXING_ENABLED` is still false; the existing invariant
correctly rejects that transitional state.

Render the new client directly from `app/games/memory/page.tsx`. Use unbranded
metadata describing an available local card-matching game, canonical
`/games/memory`, and no noindex directive. Remove all `WorkInProgress` usage.

Set Memory status to `available`, keep processing `local`, and remove its Knip
entry exemption. Do not change other game statuses.

In the same change set, set `GAMES_INDEXING_ENABLED = true` and keep the test
invariant `flag === (availableGames.length > 0)`.

Update `/games`, `/explore`, homepage status copy, metadata, badges, and sections
from “none playable/all planned” to registry-derived `1 available / 6 planned`
truth. `/games` and `/games/memory` should enter the sitemap together; all six
other game routes remain noindex and outside it.

Never hard-code `1`/`6` in UI copy. Derive them from selectors so a future
status change forces tests/content review.

**Verify**:

- `/games` and `/games/memory` are indexable and appear once in sitemap;
- all other game routes remain 200/noindex WIP pages;
- catalogs link only Memory and render planned cards noninteractively;
- titles/descriptions no longer say zero games or all games planned.

### Step 7: Run interaction, accessibility, motion, and resilience tests

Use the server-passed `ASTRAA_E2E_FIXTURES` deck order from Step 3 without
exposing a production debug control. Cover:

- pointer/touch pair success and mismatch;
- arrow-key/Enter completion;
- rapid input ignored during resolution;
- reset cancel/confirm and stale-timer regression;
- completion focus/announcement and Play again;
- hard refresh returns to the identical ready shell with no hydration mismatch,
  then Start creates the fixed E2E deck;
- 320/390 px, dark/light, reduced motion, 44 px targets;
- no console/page error and no external network requests from the game.

`playwright.config.ts:42-47` runs only `accessibility.spec.ts` in the
reduced-motion project. Put Memory's reduced-motion assertion in that file;
keep the full interaction flow in the normal Chromium project rather than
claiming every Memory spec runs in every project.

**Verify**: normal targeted Memory tests pass, and
`npm run test:e2e -- --project=chromium-reduced-motion tests/e2e/accessibility.spec.ts`
passes the Memory reduced-motion assertion.

### Step 8: Run full launch gates and set the observation boundary

Run full quality, E2E build, Playwright, SEO, and accessibility suites. Capture
desktop/mobile screenshots for game, Games catalog, and Explore.

Document in the implementation handoff—not as a fabricated metric—that no
second game should launch until the maintainer reviews real user feedback or
existing privacy-approved aggregate product data. Do not add telemetry in this
plan. Candidate direction after that gate:

- Snake: only as a fresh pure-engine accessible rewrite;
- Sudoku: only with verified single-solution puzzle data and larger a11y budget;
- Word Search/2048: defer unless requested;
- Music/Dino/Pacman: do not revive their old definitions or deleted prototypes.

**Verify**: every automated gate passes; the handoff explicitly separates
shipped Memory from uncommitted candidate direction.

## Test plan

- Pure engine: deck invariants, deterministic shuffle, all reducer transitions,
  stale actions, reset, completion, counters.
- Component: sole timer cleanup, focus management, accessible labels/live state,
  destructive reset confirmation, reduced motion.
- E2E: deterministic completion by pointer and keyboard, mobile/touch,
  dark/light, refresh, axe, console/network diagnostics.
- SEO/route: first-game flag, catalog link semantics, metadata, canonical,
  robots, sitemap, peer WIP isolation.

## Done criteria

- [ ] Memory uses a pure tested engine with eight unique pairs and no stale timer path.
- [ ] Full game is usable by pointer, touch, keyboard, and screen reader at 320 px.
- [ ] Reset confirmation/focus and completion announcement are deterministic.
- [ ] Memory is the only available game; six peers remain noninteractive/noindex.
- [ ] `/games` and `/games/memory` become indexable and enter sitemap together.
- [ ] No external asset/request, persistence, new telemetry, or added dependency exists.
- [ ] Full quality/build/browser/SEO/a11y gates pass and Plan 014 is `DONE`.

## STOP conditions

Stop and report if:

- The state model still permits more than one active resolution or an old-round update.
- Keyboard or screen-reader users cannot determine, select, and revisit cards.
- A 4×4 board cannot maintain 44 px targets without overflow at 320 px.
- First-game launch leaves any “zero playable” claim or indexes another WIP game.
- Requirements expand into persistence, leaderboard, external media, or analytics collection.
- Another game is expected to launch in the same phase.
- Full verification still fails after two focused attempts.

## Maintenance notes

- Keep the engine React-free and inject randomness for every test. Future board
  sizes, themes, or timing are product features, not reducer shortcuts.
- `GAMES_INDEXING_ENABLED` remains a deliberate review gate, not a redundant
  constant; any future change must reconcile catalog copy and sitemap tests.
- Do not treat the remaining public planned list as a commitment date. Prune or
  prioritize it only through an explicit product decision and Notion Roadmap update.
