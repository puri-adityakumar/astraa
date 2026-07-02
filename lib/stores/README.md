# State Management (`lib/stores/`)

This directory holds the **Zustand stores** used for tool-local, persisted state, plus the
storage layer they are built on. App-level cross-tree state (the tool catalog and activity
tracking) is provided via React Context — see `lib/tools-context.tsx` (`ToolsProvider`) and
`lib/activity-tracker.tsx` (`ActivityProvider`), both mounted in `app/layout.tsx`.

## What lives here

| File | Purpose | Consumers |
| --- | --- | --- |
| `storage.ts` | `createZustandStorage()` + IndexedDB/localStorage adapters + a per-key concurrency lock. Also exports `clearAllStoredData`, `exportAllStoredData`, `importStoredData`. | Every persisted store below |
| `tool-settings.ts` | `useToolSettings` — per-tool settings, usage tracking, last-used timestamps, import/export. Persisted. | snippet, markdown, base64, regex, json clients |
| `json-editor.ts` | `useJsonEditor` — JSON editor document/selection state. Persisted. | `components/json/json-editor-client.tsx` |
| `markdown-editor.ts` | `useMarkdownEditor` — markdown editor document + file list. Persisted. | `components/markdown/markdown-editor-client.tsx` |
| `snippet-generator.ts` | `useSnippetGenerator` — snippet generator state. Persisted. | `components/snippet-generator/snippet-generator-client.tsx` |
| `regex-tester.ts` | `useRegexTester` — regex tester reference-panel tab state. Persisted. | `components/regex-tester/*` |
| `types.ts` | Shared store types (`ToolSettings`, `Activity`, etc.). | stores above |

> Note: there is **no** `StoreProvider` and **no** `migration.ts`/`index.ts` barrel — an
> earlier Zustand-migration subtree was never mounted and has been removed. The app mounts
> `ToolsProvider` + `ActivityProvider` (Context) in `app/layout.tsx`. Do not reintroduce a
> provider/migration layer here without wiring it into the layout.

## Usage

```typescript
// Per-tool usage tracking (most common)
import { useToolSettings } from "@/lib/stores/tool-settings";

function MyToolClient() {
  const updateToolUsage = useToolSettings((s) => s.updateToolUsage);
  useEffect(() => {
    updateToolUsage("my-tool");
  }, [updateToolUsage]);
}

// Out-of-band access (e.g. from an effect that already closed over the hook)
useToolSettings.getState().updateToolUsage("/tools/markdown");
```

## Persistence

Stores are persisted via `createZustandStorage()` from `storage.ts`, which uses **IndexedDB
with a localStorage fallback** and a per-key promise-chaining lock so concurrent reads/writes
to the same key are serialized (a failed operation never deadlocks the queue — the chain's
`.catch(() => {})` swallows the error so subsequent ops still run).

```typescript
import { clearAllStoredData, exportAllStoredData, importStoredData } from "@/lib/stores/storage";

const backup = await exportAllStoredData();        // full export (JSON string)
await importStoredData(backup);                    // restore
await clearAllStoredData();                        // wipe persisted state
```

## Testing

Stores are plain Zustand hooks, so they can be driven directly in tests via
`useXxx.getState()` / `useXxx.setState(...)`. Co-located test files follow the
`lib/stores/<name>.test.ts` convention (see `json-editor.test.ts`, etc.).
