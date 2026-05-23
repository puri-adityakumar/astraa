// components/snippet-generator/panel/theme-section.tsx
"use client";

import { cn } from "@/lib/utils";
import { THEMES, LANGUAGES } from "@/lib/snippet-generator/defaults";
import { Label } from "@/components/ui/label";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export function ThemeSection() {
  const theme = useSnippetGenerator((s) => s.theme);
  const language = useSnippetGenerator((s) => s.language);
  const setTheme = useSnippetGenerator((s) => s.setTheme);
  const setLanguage = useSnippetGenerator((s) => s.setLanguage);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="lang-select">Language</Label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded-md px-2 py-1.5 bg-background min-h-touch"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Theme</Label>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-pressed={theme === t.id}
              className={cn(
                "px-2 py-2 text-xs rounded-md border min-h-touch",
                theme === t.id ? "border-primary bg-primary/10" : "border-border",
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
