"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { Base64InputType } from "@/lib/base64";
import { Base64FileDrop } from "./base64-file-drop";

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
        <Base64FileDrop file={file} onFile={onFileChange} />
      )}
    </div>
  );
}
