"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Base64InputType } from "@/lib/base64";

export interface Base64InputProps {
  inputType: Base64InputType;
  onInputTypeChange: (next: Base64InputType) => void;
  textValue: string;
  onTextChange: (next: string) => void;
  fileSlot: React.ReactNode;
  placeholder?: string;
}

export function Base64Input({
  inputType,
  onInputTypeChange,
  textValue,
  onTextChange,
  fileSlot,
  placeholder,
}: Base64InputProps) {
  return (
    <div className="space-y-3">
      <Tabs
        value={inputType}
        onValueChange={(v) => onInputTypeChange(v as Base64InputType)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="file">File</TabsTrigger>
        </TabsList>
      </Tabs>

      {inputType === "text" ? (
        <div className="space-y-1.5">
          <Label htmlFor="base64-input-text" className="text-sm font-medium">
            Input
          </Label>
          <Textarea
            id="base64-input-text"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className={cn(
              "font-mono text-sm leading-relaxed min-h-[8rem] resize-y",
            )}
          />
        </div>
      ) : (
        fileSlot
      )}
    </div>
  );
}
