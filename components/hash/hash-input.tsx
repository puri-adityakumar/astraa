"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HashSelector } from "./hash-selector";

interface HashInputProps {
  value: string;
  selectedHash: string;
  onChange: (value: string) => void;
  onHashChange: (value: string) => void;
  onGenerate: () => void;
}

export function HashInput({
  value,
  selectedHash,
  onChange,
  onHashChange,
  onGenerate,
}: HashInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="input">Input Text</Label>
        <Textarea
          id="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter text to hash..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <HashSelector selectedHash={selectedHash} onHashChange={onHashChange} />
        <Button className="min-h-[40px] flex-1" onClick={onGenerate}>
          Generate Hash
        </Button>
      </div>
    </div>
  );
}
