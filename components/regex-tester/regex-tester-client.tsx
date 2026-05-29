"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToolSettings } from "@/lib/stores/tool-settings";

export function RegexTesterClient() {
  useEffect(() => {
    useToolSettings.getState().updateToolUsage("regex-tester");
  }, []);

  return (
    <div className="container px-4 sm:px-6 max-w-2xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Regex Tester
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Test JavaScript regular expressions live, with capture-group highlights, replace mode, and shareable URLs.
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Card className="p-4 sm:p-6 space-y-6" />
    </div>
  );
}
