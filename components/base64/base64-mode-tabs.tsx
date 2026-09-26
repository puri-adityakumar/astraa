"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Base64Mode } from "@/lib/base64";

export interface Base64ModeTabsProps {
  mode: Base64Mode;
  onChange: (mode: Base64Mode) => void;
}

export function Base64ModeTabs({ mode, onChange }: Base64ModeTabsProps) {
  return (
    <Tabs
      value={mode}
      onValueChange={(v) => onChange(v as Base64Mode)}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="encode">Encode</TabsTrigger>
        <TabsTrigger value="decode">Decode</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
