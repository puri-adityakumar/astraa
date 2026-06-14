"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRegexTester } from "@/lib/stores/regex-tester";
import { emitCode } from "@/lib/regex-tester/code-emit";
import type { CodeLang } from "@/lib/regex-tester/types";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

const LANGS: { value: CodeLang; label: string }[] = [
  { value: "js", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "go", label: "Go" },
  { value: "php", label: "PHP" },
];

export function CodeEmitPanel() {
  const pattern = useRegexTester((s) => s.pattern);
  const flags = useRegexTester((s) => s.flags);
  const codeLang = useRegexTester((s) => s.codeLang);
  const setCodeLang = useRegexTester((s) => s.setCodeLang);

  const output = useMemo(
    () => emitCode(pattern, flags, codeLang),
    [pattern, flags, codeLang],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Select
          value={codeLang}
          onValueChange={(v) => setCodeLang(v as CodeLang)}
        >
          <SelectTrigger className="w-[148px] min-h-touch text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGS.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CopyButton text={output} label={`${codeLang} snippet`} size="icon" />
      </div>
      <Textarea
        readOnly
        value={output}
        aria-label="Generated code snippet"
        className={cn(
          "font-mono text-xs leading-relaxed",
          "min-h-[10rem] resize-y bg-muted/30",
        )}
        spellCheck={false}
      />
    </div>
  );
}
