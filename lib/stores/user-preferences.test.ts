import { describe, it, expect } from "vitest";
import { useUserPreferences } from "./user-preferences";
import type { UserPreferences } from "./types";

type MigratedState = { preferences: UserPreferences };

describe("user-preferences migrate()", () => {
  const migrate = useUserPreferences.persist.getOptions().migrate!;

  it("merges a v0 blob over defaults, keeping user-set values", () => {
    const oldBlob = {
      preferences: {
        theme: "dark",
        language: "fr",
        accessibility: {
          reducedMotion: true,
          highContrast: true,
          fontSize: "large",
          screenReader: false,
        },
        privacy: {
          analytics: true,
          errorReporting: false,
          cloudSync: true,
          dataSharing: false,
        },
        shortcuts: {
          "global.search": "ctrl+k",
        },
        toolDefaults: { hash: { algo: "sha256" } },
      },
    };

    const migrated = migrate(oldBlob, 0) as MigratedState;

    // user-set values survive the migration
    expect(migrated.preferences.theme).toBe("dark");
    expect(migrated.preferences.language).toBe("fr");
    expect(migrated.preferences.accessibility.reducedMotion).toBe(true);
    expect(migrated.preferences.accessibility.fontSize).toBe("large");
    expect(migrated.preferences.privacy.analytics).toBe(true);
    expect(migrated.preferences.privacy.cloudSync).toBe(true);
    expect(migrated.preferences.shortcuts["global.search"]).toBe("ctrl+k");
    expect(migrated.preferences.toolDefaults).toEqual({ hash: { algo: "sha256" } });
  });

  it("fills missing top-level keys from defaults for a sparse v0 blob", () => {
    const oldBlob = { preferences: { theme: "light" } };

    const migrated = migrate(oldBlob, 0) as MigratedState;

    // the one provided key wins
    expect(migrated.preferences.theme).toBe("light");
    // absent keys come from defaults (no data wiped to undefined)
    expect(migrated.preferences.language).toBe("en");
    expect(migrated.preferences.accessibility).toBeDefined();
    expect(migrated.preferences.accessibility.fontSize).toBe("medium");
    expect(migrated.preferences.privacy).toBeDefined();
    expect(migrated.preferences.privacy.errorReporting).toBe(true);
    expect(migrated.preferences.shortcuts).toBeDefined();
    expect(migrated.preferences.toolDefaults).toEqual({});
  });

  it("preserves any extra top-level fields on the v0 blob", () => {
    const oldBlob = {
      preferences: { theme: "dark" },
      _legacyFlag: 42,
    };

    const migrated = migrate(oldBlob, 0) as MigratedState & { _legacyFlag: number };

    expect(migrated._legacyFlag).toBe(42);
    expect(migrated.preferences.theme).toBe("dark");
  });

  it("passes a current-version (v1) blob through untouched", () => {
    const current = {
      preferences: {
        theme: "system" as const,
        language: "en",
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: "medium" as const,
          screenReader: false,
        },
        privacy: {
          analytics: false,
          errorReporting: true,
          cloudSync: false,
          dataSharing: false,
        },
        shortcuts: {},
        toolDefaults: {},
      },
    };

    const migrated = migrate(current, 1);
    expect(migrated).toBe(current);
  });
});
