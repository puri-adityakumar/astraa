"use client";

import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { STARTERS } from "@/lib/regex-tester/starters";
import { CHEATSHEET } from "@/lib/regex-tester/cheatsheet";
import { generateExample } from "@/lib/regex-tester/example-gen";
import type { CheatsheetToken } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";
import { ExplainPanel } from "./explain-panel";
import { MiniTestsPanel } from "./mini-tests-panel";
import { CodeEmitPanel } from "./code-emit-panel";

export interface ReferencePanelProps {
  onInsertAtCaret: (text: string) => void;
}

const CATEGORY_LABELS: Record<CheatsheetToken["category"], string> = {
  anchors: "Anchors",
  quantifiers: "Quantifiers",
  classes: "Character classes",
  groups: "Groups & backreferences",
  lookaround: "Lookaround",
  escapes: "Escapes",
};

const CATEGORY_ORDER: CheatsheetToken["category"][] = [
  "anchors",
  "quantifiers",
  "classes",
  "groups",
  "lookaround",
  "escapes",
];

export function ReferencePanel({ onInsertAtCaret }: ReferencePanelProps) {
  const pattern = useRegexTester((s) => s.pattern);
  const setPattern = useRegexTester((s) => s.setPattern);
  const setFlags = useRegexTester((s) => s.setFlags);
  const setTestString = useRegexTester((s) => s.setTestString);
  const selectedTab = useRegexTester((s) => s.selectedReferenceTab);
  const setSelectedTab = useRegexTester((s) => s.setSelectedReferenceTab);
  const { toast } = useToast();

  const [search, setSearch] = useState("");

  const handleGenerateExample = () => {
    const sample = generateExample(pattern);
    if (sample === null) {
      toast({
        title: "Cannot generate example",
        description:
          "This pattern uses features we can't reverse-generate (lookbehind, backreferences, or very large repeats).",
        variant: "destructive",
      });
      return;
    }
    setTestString(sample);
    toast({
      title: "Example loaded",
      description: "Test string updated with a generated example.",
    });
  };

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? CHEATSHEET.filter(
          (t) =>
            t.token.toLowerCase().includes(q) ||
            t.label.toLowerCase().includes(q),
        )
      : CHEATSHEET;
    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: filtered.filter((t) => t.category === cat),
    })).filter((g) => g.items.length > 0);
  }, [search]);

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(v) =>
        setSelectedTab(v as Parameters<typeof setSelectedTab>[0])
      }
      className="w-full"
    >
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="starters">Starters</TabsTrigger>
        <TabsTrigger value="cheatsheet">Cheatsheet</TabsTrigger>
        <TabsTrigger value="explain">Explain</TabsTrigger>
        <TabsTrigger value="tests">Tests</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>

      <TabsContent value="starters" className="mt-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STARTERS.map((s) => (
            <Button
              key={s.id}
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "justify-start text-left h-auto py-2 min-h-touch",
                "whitespace-normal break-words",
              )}
              onClick={() => {
                setPattern(s.pattern);
                setFlags(s.flags);
              }}
              title={s.description}
            >
              <span className="text-xs">{s.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          Click a starter to load its pattern and flags.
        </p>
        <div className="pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateExample}
            disabled={pattern.length === 0}
            className="min-h-touch"
          >
            <Wand2 className="h-4 w-4 mr-2" aria-hidden="true" />
            Generate example from current pattern
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="cheatsheet" className="mt-4 space-y-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tokens…"
          aria-label="Search cheatsheet"
          className="text-sm"
        />
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
          {grouped.length === 0 && (
            <p className="text-xs italic text-muted-foreground">
              No tokens matched.
            </p>
          )}
          {grouped.map((group) => (
            <div key={group.category} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((token) => (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => onInsertAtCaret(token.insertAtCaret)}
                    title={token.label}
                    aria-label={`Insert ${token.token}: ${token.label}`}
                    className={cn(
                      "rounded-md border border-border bg-background px-2 py-1",
                      "text-xs font-mono text-foreground min-h-touch",
                      "hover:bg-muted/60 hover:border-foreground/40",
                      "transition-colors duration-100 ease-out",
                      "focus-visible:outline-none focus-visible:ring-2",
                      "focus-visible:ring-ring focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-background",
                    )}
                  >
                    {token.token}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="explain" className="mt-4">
        <ExplainPanel />
      </TabsContent>

      <TabsContent value="tests" className="mt-4">
        <MiniTestsPanel />
      </TabsContent>

      <TabsContent value="code" className="mt-4">
        <CodeEmitPanel />
      </TabsContent>
    </Tabs>
  );
}
