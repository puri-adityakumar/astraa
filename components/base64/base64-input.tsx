"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Base64InputType } from "@/lib/base64";
import { Base64FileDrop } from "./base64-file-drop";

const INPUT_TYPE_LABELS: Record<Base64InputType, string> = {
  text: "Text",
  file: "File",
};

export interface Base64InputProps {
  inputType: Base64InputType;
  onInputTypeChange: (next: Base64InputType) => void;
  textValue: string;
  onTextChange: (next: string) => void;
  file: { name: string; bytes: Uint8Array } | null;
  onFileChange: (file: { name: string; bytes: Uint8Array } | null) => void;
  placeholder?: string;
}

export function Base64Input({
  inputType,
  onInputTypeChange,
  textValue,
  onTextChange,
  file,
  onFileChange,
  placeholder,
}: Base64InputProps) {
  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Base64 input type"
        className="grid min-h-touch w-full grid-cols-2 items-center justify-center rounded-lg border bg-muted/50 p-0.5 text-muted-foreground"
      >
        {(["text", "file"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={inputType === value}
            onClick={() => onInputTypeChange(value)}
            className={cn(
              "inline-flex min-h-touch items-center justify-center rounded-md border border-transparent px-3 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              inputType === value && "border-border bg-background text-foreground shadow-geist",
            )}
          >
            {INPUT_TYPE_LABELS[value]}
          </button>
        ))}
      </div>

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
            className={cn("font-mono text-sm leading-relaxed min-h-[8rem] resize-y")}
          />
        </div>
      ) : (
        <Base64FileDrop file={file} onFile={onFileChange} />
      )}
    </div>
  );
}
