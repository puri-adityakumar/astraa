"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToolSettings } from "@/lib/stores/tool-settings";
import type {
  Base64InputType,
  Base64Mode,
  Base64Options,
} from "@/lib/base64";
import { Base64ModeTabs } from "./base64-mode-tabs";
import { Base64Input } from "./base64-input";
import { Base64OptionsRow } from "./base64-options";

export function Base64Client() {
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [inputType, setInputType] = useState<Base64InputType>("text");
  const [textInput, setTextInput] = useState("");
  const [options, setOptions] = useState<Base64Options>({
    urlSafe: false,
    wrap76: false,
  });

  useEffect(() => {
    useToolSettings.getState().updateToolUsage("base64");
  }, []);

  return (
    <div className="container px-4 sm:px-6 max-w-2xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Base64 Encoder &amp; Decoder
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Convert text and files to and from Base64 — with URL-safe variant support and inline image preview.
        </p>
        <p className="text-xs text-muted-foreground/70">
          All processing happens locally in your browser
        </p>
      </div>
      <Card className="p-4 sm:p-6 space-y-6">
        <Base64ModeTabs mode={mode} onChange={setMode} />
        <Base64Input
          inputType={inputType}
          onInputTypeChange={setInputType}
          textValue={textInput}
          onTextChange={setTextInput}
          placeholder={
            mode === "encode"
              ? "Paste text to encode…"
              : "Paste base64 to decode…"
          }
          fileSlot={
            <p className="text-sm text-muted-foreground italic">
              File upload lands in B7.
            </p>
          }
        />
        <Base64OptionsRow
          mode={mode}
          options={options}
          onChange={setOptions}
        />
        {/* Output panel + status footer land in B8 */}
      </Card>
    </div>
  );
}
