"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useToolSettings } from "@/lib/stores/tool-settings";
import { copyToClipboard } from "@/lib/clipboard";
import { getUserFriendlyError, logError } from "@/lib/error-handler";
import {
  decodeToBytes,
  decodeToText,
  downloadAsFile,
  encodeBytes,
  encodeText,
  validateBase64,
  type Base64InputType,
  type Base64Mode,
  type Base64Options,
  type Base64Status,
} from "@/lib/base64";
import { Base64ModeTabs } from "./base64-mode-tabs";
import { Base64Input } from "./base64-input";
import { Base64OptionsRow } from "./base64-options";
import { Base64Output } from "./base64-output";
import { Base64StatusFooter } from "./base64-status-footer";

const DEBOUNCE_MS = 150;

type FileState = { name: string; bytes: Uint8Array } | null;

function byteLength(value: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(value).length;
  }
  return value.length;
}

export function Base64Client() {
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [inputType, setInputType] = useState<Base64InputType>("text");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<FileState>(null);
  const [options, setOptions] = useState<Base64Options>({
    urlSafe: false,
    wrap76: false,
  });
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Base64Status>({ kind: "idle" });

  const { toast } = useToast();

  useEffect(() => {
    useToolSettings.getState().updateToolUsage("base64");
  }, []);

  // Debounced derive of output + status from inputs/options.
  const inputKey = useMemo(
    () =>
      JSON.stringify({
        mode,
        inputType,
        textInput,
        fileName: fileInput?.name ?? null,
        fileLen: fileInput?.bytes.length ?? 0,
        options,
      }),
    [mode, inputType, textInput, fileInput, options],
  );
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      try {
        if (mode === "encode") {
          if (inputType === "text") {
            if (textInput.length === 0) {
              setOutput("");
              setStatus({ kind: "idle" });
              return;
            }
            const out = encodeText(textInput, options);
            setOutput(out);
            setStatus({
              kind: "valid",
              inputBytes: byteLength(textInput),
              outputBytes: out.length,
            });
          } else {
            if (!fileInput) {
              setOutput("");
              setStatus({ kind: "idle" });
              return;
            }
            const out = encodeBytes(fileInput.bytes, options);
            setOutput(out);
            setStatus({
              kind: "valid",
              inputBytes: fileInput.bytes.length,
              outputBytes: out.length,
            });
          }
        } else {
          // decode
          const source = inputType === "text"
            ? textInput
            : fileInput
              ? new TextDecoder("utf-8", { fatal: false }).decode(
                  fileInput.bytes,
                )
              : "";
          if (source.trim().length === 0) {
            setOutput("");
            setStatus({ kind: "idle" });
            return;
          }
          const validation = validateBase64(source, { urlSafe: options.urlSafe });
          if (!validation.ok) {
            setOutput("");
            setStatus({ kind: "invalid", reason: validation.reason });
            return;
          }
          const out = decodeToText(source, options);
          setOutput(out);
          setStatus({
            kind: "valid",
            inputBytes: byteLength(source),
            outputBytes: byteLength(out),
          });
        }
      } catch (error) {
        const details = getUserFriendlyError(error);
        setOutput("");
        setStatus({ kind: "error", message: details.message });
        logError(error, { context: "base64/convert" });
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [inputKey, mode, inputType, textInput, fileInput, options]);

  const handleCopy = useCallback(async () => {
    if (output.length === 0) return;
    const result = await copyToClipboard(output);
    toast(
      result.success
        ? { title: "Copied" }
        : {
            title: "Copy failed",
            description: result.error,
            variant: "destructive",
          },
    );
  }, [output, toast]);

  const handleDownload = useCallback(() => {
    if (output.length === 0) return;
    const filename =
      mode === "encode"
        ? inputType === "file" && fileInput
          ? `${fileInput.name}.base64.txt`
          : "encoded.txt"
        : "decoded.bin";
    const mime = mode === "encode" ? "text/plain" : "application/octet-stream";
    try {
      if (mode === "decode") {
        // Best-effort raw bytes for binary decode output.
        const bytes = decodeToBytes(
          inputType === "text"
            ? textInput
            : fileInput
              ? new TextDecoder().decode(fileInput.bytes)
              : "",
          options,
        );
        downloadAsFile(bytes, filename, mime);
      } else {
        downloadAsFile(output, filename, mime);
      }
    } catch (error) {
      const details = getUserFriendlyError(error);
      toast({
        title: details.title,
        description: details.message,
        variant: "destructive",
      });
      logError(error, { context: "base64/download" });
    }
  }, [output, mode, inputType, fileInput, textInput, options, toast]);

  const handleSwap = useCallback(() => {
    if (output.length === 0) return;
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInputType("text");
    setTextInput(output);
    setFileInput(null);
    setOutput("");
    setStatus({ kind: "idle" });
  }, [output]);

  const handleClear = useCallback(() => {
    setTextInput("");
    setFileInput(null);
    setOutput("");
    setStatus({ kind: "idle" });
  }, []);

  const handleModeChange = useCallback(
    (next: Base64Mode) => {
      setMode(next);
      setOutput("");
      setStatus({ kind: "idle" });
    },
    [],
  );

  const handleInputTypeChange = useCallback(
    (next: Base64InputType) => {
      setInputType(next);
      if (next === "text") setFileInput(null);
      else setTextInput("");
      setOutput("");
      setStatus({ kind: "idle" });
    },
    [],
  );

  const inputBytes =
    status.kind === "valid"
      ? status.inputBytes
      : inputType === "text"
        ? byteLength(textInput)
        : fileInput?.bytes.length ?? 0;
  const outputBytes =
    status.kind === "valid" ? status.outputBytes : output.length;

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
        <Base64ModeTabs mode={mode} onChange={handleModeChange} />
        <Base64Input
          inputType={inputType}
          onInputTypeChange={handleInputTypeChange}
          textValue={textInput}
          onTextChange={setTextInput}
          file={fileInput}
          onFileChange={setFileInput}
          placeholder={
            mode === "encode"
              ? "Paste text to encode…"
              : "Paste base64 to decode…"
          }
        />
        <Base64OptionsRow
          mode={mode}
          options={options}
          onChange={setOptions}
        />
        <Base64Output
          mode={mode}
          output={output}
          status={status}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onSwap={handleSwap}
          onClear={handleClear}
        />
        <Base64StatusFooter
          inputBytes={inputBytes}
          outputBytes={outputBytes}
        />
      </Card>
    </div>
  );
}
