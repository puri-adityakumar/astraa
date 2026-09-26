"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  containerType: "object" | "array";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (key: string | null, value: string) => void;
  trigger: React.ReactNode;
};

export function TreeAddMenu({ containerType, open, onOpenChange, onAdd, trigger }: Props) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-72 space-y-3">
        {containerType === "object" && (
          <div>
            <Label htmlFor="add-key">Key</Label>
            <Input
              id="add-key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="newKey"
              className="mt-1"
            />
          </div>
        )}
        <div>
          <Label htmlFor="add-value">Value</Label>
          <Input
            id="add-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Default string value"
            className="mt-1"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onAdd(containerType === "object" ? key || "newKey" : null, value);
              setKey("");
              setValue("");
              onOpenChange(false);
            }}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
