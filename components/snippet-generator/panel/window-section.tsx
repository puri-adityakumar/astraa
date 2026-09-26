"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export function WindowSection() {
  const chrome = useSnippetGenerator((s) => s.windowChrome);
  const filename = useSnippetGenerator((s) => s.filename);
  const setWindowChrome = useSnippetGenerator((s) => s.setWindowChrome);
  const setFilename = useSnippetGenerator((s) => s.setFilename);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="chrome-toggle">macOS chrome</Label>
        <Switch
          id="chrome-toggle"
          checked={chrome === "macos"}
          onCheckedChange={(v) => setWindowChrome(v ? "macos" : "none")}
        />
      </div>
      <div>
        <Label htmlFor="filename-input">Filename</Label>
        <Input
          id="filename-input"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          maxLength={100}
        />
      </div>
    </div>
  );
}
