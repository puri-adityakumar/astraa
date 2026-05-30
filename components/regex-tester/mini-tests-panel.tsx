"use client";

import { useMemo } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { compileRegex } from "@/lib/regex-tester/compile";
import { runMiniTests } from "@/lib/regex-tester/tests-runner";
import type { MiniTest } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";

const newId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function MiniTestsPanel() {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const miniTests = useRegexTester((s) => s.miniTests);
  const setMiniTests = useRegexTester((s) => s.setMiniTests);

  const results = useMemo(() => {
    const compiled = compileRegex(pattern, flags);
    return runMiniTests(compiled.ok ? compiled.regex : null, miniTests);
  }, [pattern, flags, miniTests]);

  const handleAdd = () => {
    const next: MiniTest = {
      id: newId(),
      kind: "should-match",
      input: "",
    };
    setMiniTests([...miniTests, next]);
  };

  const handleUpdate = (id: string, patch: Partial<MiniTest>) => {
    setMiniTests(
      miniTests.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const handleRemove = (id: string) => {
    setMiniTests(miniTests.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Pin sample inputs to verify the pattern keeps matching what it should
        — or stays away from what it shouldn&rsquo;t.
      </p>

      <ul className="space-y-2">
        {miniTests.map((test) => {
          const result = results.find((r) => r.id === test.id);
          const passed = result?.passed === true;
          const reason = result?.reason ?? "";
          return (
            <li
              key={test.id}
              className={cn(
                "flex flex-wrap items-center gap-2 rounded-md border p-2",
                passed
                  ? "border-success/40 bg-success/5"
                  : "border-destructive/40 bg-destructive/5",
              )}
            >
              <Select
                value={test.kind}
                onValueChange={(v) =>
                  handleUpdate(test.id, {
                    kind: v as MiniTest["kind"],
                  })
                }
              >
                <SelectTrigger className="w-[148px] min-h-touch text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="should-match">Should match</SelectItem>
                  <SelectItem value="should-not-match">
                    Should not match
                  </SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={test.input}
                onChange={(e) =>
                  handleUpdate(test.id, { input: e.target.value })
                }
                placeholder="input to test"
                className="flex-1 font-mono text-xs min-w-[10rem]"
                spellCheck={false}
                aria-label="Test input"
              />

              <span
                className="flex items-center gap-1 text-xs"
                title={reason}
              >
                {passed ? (
                  <Check
                    className="h-4 w-4 text-success"
                    aria-label={`Passing: ${reason}`}
                  />
                ) : (
                  <X
                    className="h-4 w-4 text-destructive"
                    aria-label={`Failing: ${reason}`}
                  />
                )}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(test.id)}
                aria-label="Remove test"
                className="min-h-touch min-w-touch"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="min-h-touch"
      >
        <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
        Add test
      </Button>
    </div>
  );
}
