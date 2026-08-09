# Focused editor stores

Astraa uses Zustand only where a tool has durable editor state. There is no
application-wide store provider, preferences store, activity tracker, or tool
usage counter.

## Stores

| Store                  | Persisted key       | Purpose                                               |
| ---------------------- | ------------------- | ----------------------------------------------------- |
| `json-editor.ts`       | `json-editor`       | JSON document, view, and editor preferences           |
| `markdown-editor.ts`   | `markdown-editor`   | Up to ten local Markdown files and editor state       |
| `regex-tester.ts`      | `regex-tester`      | Pattern, flags, test input, and reference-panel state |
| `snippet-generator.ts` | `snippet-generator` | Snippet appearance and export settings                |

Import a store directly from its module and select only the state a component
needs:

```typescript
import { useJsonEditor } from "@/lib/stores/json-editor";

const text = useJsonEditor((state) => state.text);
const setText = useJsonEditor((state) => state.setText);
```

Do not add a barrel or root provider for these stores. Tool and game catalog
data comes directly from the immutable `lib/tools.ts` and `lib/games.ts`
registries.

## Persistence contract

`storage.ts` exposes the SSR-safe adapter used by Zustand's `persist`
middleware. It prefers IndexedDB, falls back to localStorage, serializes
operations per key, and degrades to in-memory editor state when browser storage
is unavailable.

Each persisted store must:

- own a version number and migration callback when its schema can change;
- cap stored collections and payload sizes;
- omit volatile or derived fields with `partialize` or an equivalent helper;
- remain usable when persistence reads or writes fail;
- add or update a co-located unit test for migrations and boundary behavior.

Legacy keys from deleted experimental stores may remain in a user's browser.
They are intentionally ignored rather than erased during startup.
