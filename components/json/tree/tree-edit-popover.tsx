"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JsonType, JsonValue } from "@/lib/json/types";

type Props = {
  initialValue: JsonValue;
  initialType: JsonType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newValue: JsonValue) => void;
  trigger: React.ReactNode;
};

const TYPES: JsonType[] = ["string", "number", "boolean", "null", "object", "array"];

function coerce(input: string, target: JsonType): JsonValue {
  switch (target) {
    case "string":
      return input;
    case "number": {
      const n = Number(input);
      return Number.isFinite(n) ? n : 0;
    }
    case "boolean":
      return input === "true";
    case "null":
      return null;
    case "object":
      return {};
    case "array":
      return [];
  }
}

export function TreeEditPopover({
  initialValue,
  initialType,
  open,
  onOpenChange,
  onSave,
  trigger,
}: Props) {
  const [type, setType] = useState<JsonType>(initialType);
  const [draft, setDraft] = useState<string>(
    initialType === "object" || initialType === "array" || initialValue === null
      ? ""
      : String(initialValue),
  );

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        <div>
          <Label htmlFor="edit-type">Type</Label>
          <select
            id="edit-type"
            value={type}
            onChange={(e) => setType(e.target.value as JsonType)}
            className="w-full mt-1 border rounded-md px-2 py-1.5 bg-background min-h-touch"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {(type === "string" || type === "number" || type === "boolean") && (
          <div>
            <Label htmlFor="edit-value">Value</Label>
            {type === "boolean" ? (
              <select
                id="edit-value"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full mt-1 border rounded-md px-2 py-1.5 bg-background min-h-touch"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : (
              <Input
                id="edit-value"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                type={type === "number" ? "number" : "text"}
                className="mt-1"
              />
            )}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSave(coerce(draft, type));
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
