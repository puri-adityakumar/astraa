"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import { copyToClipboard } from "@/lib/clipboard";
import { logError } from "@/lib/error-handler";
import { formatSql } from "@/lib/sql/worker-client";
import {
  DEFAULT_SQL_OPTIONS,
  MAX_SQL_BYTES,
  SQL_DIALECTS,
  SQL_SIZE_LABEL,
  SQL_UPSTREAM_LIMITATION,
} from "@/lib/sql/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  SqlFormatOptions,
  SqlFormatResult,
  SqlIndentSize,
  SqlKeywordCase,
} from "@/lib/sql/types";

const KEYWORD_CASE_OPTIONS: readonly { label: string; value: SqlKeywordCase }[] = [
  { label: "Preserve", value: "preserve" },
  { label: "UPPERCASE", value: "upper" },
  { label: "lowercase", value: "lower" },
];

const INDENT_OPTIONS: readonly { label: string; value: SqlIndentSize }[] = [
  { label: "2 spaces", value: 2 },
  { label: "4 spaces", value: 4 },
];

export function SqlFormatterClient() {
  const sourceRef = useRef<HTMLTextAreaElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState("");
  const [options, setOptions] = useState<SqlFormatOptions>(DEFAULT_SQL_OPTIONS);
  const [result, setResult] = useState<SqlFormatResult | null>(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const output = result?.status === "success" ? result.output : "";
  const sourceByteLength = new TextEncoder().encode(source).byteLength;
  const formatDisabled = source.trim() === "" || isFormatting;
  const errorResult =
    result && result.status !== "success" && result.status !== "empty" ? result : null;

  useEffect(() => {
    if (errorResult) errorRef.current?.focus();
  }, [errorResult]);

  const handleFormat = async (): Promise<void> => {
    if (formatDisabled) return;

    setIsFormatting(true);
    setCopyMessage("");
    setResult(null);
    const nextResult = await formatSql(source, options);
    setResult(nextResult);
    setIsFormatting(false);

    if (nextResult.status === "load-error" || nextResult.status === "unexpected-error") {
      logError(
        new Error(
          nextResult.status === "load-error"
            ? "SQL formatter lazy load failed"
            : "SQL formatter execution failed",
        ),
        { failureKind: nextResult.status, operation: "sql/format" },
      );
    }
  };

  const handleCopy = async (): Promise<void> => {
    if (output === "") return;

    const copyResult = await copyToClipboard(output);
    setCopyMessage(
      copyResult.success
        ? "Formatted SQL copied."
        : (copyResult.error ?? "Formatted SQL could not be copied. Try again."),
    );
  };

  const handleClear = (): void => {
    setSource("");
    setResult(null);
    setCopyMessage("Source and output cleared.");
    sourceRef.current?.focus();
  };

  const handleSourceChange = (value: string): void => {
    setSource(value);
    setResult(null);
    setCopyMessage("");
  };

  const updateOptions = (nextOptions: SqlFormatOptions): void => {
    setOptions(nextOptions);
    setResult(null);
    setCopyMessage("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <header className="space-y-3 border-b pb-8 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          SQL Formatter
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Make SQL whitespace easier to scan without changing your source text.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          SQL is processed locally in this browser after you choose Format
        </p>
      </header>

      <Card className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <SqlOptionSelect
            id="sql-dialect"
            label="Dialect"
            value={options.dialect}
            disabled={isFormatting}
            onChange={(dialect) => updateOptions({ ...options, dialect })}
            options={SQL_DIALECTS.map((dialect) => ({
              label: dialect.label,
              value: dialect.id,
            }))}
          />
          <SqlOptionSelect
            id="sql-keyword-case"
            label="Keyword case"
            value={options.keywordCase}
            disabled={isFormatting}
            onChange={(keywordCase) => updateOptions({ ...options, keywordCase })}
            options={KEYWORD_CASE_OPTIONS}
          />
          <SqlOptionSelect
            id="sql-indentation"
            label="Indentation"
            value={String(options.indentSize)}
            disabled={isFormatting}
            onChange={(indentSize) =>
              updateOptions({ ...options, indentSize: Number(indentSize) as SqlIndentSize })
            }
            options={INDENT_OPTIONS.map((option) => ({
              label: option.label,
              value: String(option.value),
            }))}
          />
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <Label htmlFor="sql-source">Source SQL</Label>
              <span
                id="sql-source-size"
                className={
                  sourceByteLength > MAX_SQL_BYTES
                    ? "text-xs font-medium text-destructive"
                    : "text-xs text-muted-foreground"
                }
              >
                {sourceByteLength.toLocaleString()} bytes of {SQL_SIZE_LABEL}
              </span>
            </div>
            <Textarea
              ref={sourceRef}
              id="sql-source"
              value={source}
              onChange={(event) => handleSourceChange(event.target.value)}
              aria-describedby="sql-source-help sql-source-size"
              className="min-h-80 max-w-full resize-y overflow-auto font-mono text-sm"
              disabled={isFormatting}
              placeholder="SELECT id, name FROM users WHERE active = true;"
              spellCheck={false}
            />
            <p id="sql-source-help" className="text-xs leading-5 text-muted-foreground">
              Source SQL is never replaced automatically. Maximum input: {SQL_SIZE_LABEL}.
            </p>
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="sql-output">Formatted SQL (read-only)</Label>
            <Textarea
              id="sql-output"
              value={output}
              aria-describedby="sql-output-help sql-result-status"
              aria-busy={isFormatting}
              className="min-h-80 max-w-full resize-y overflow-auto font-mono text-sm"
              placeholder="Formatted SQL will appear here."
              readOnly
              spellCheck={false}
            />
            <p id="sql-output-help" className="text-xs leading-5 text-muted-foreground">
              A formatted result is not proof that SQL is safe, valid, executable, or optimized.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={formatDisabled}
            onClick={handleFormat}
          >
            {isFormatting ? "Formatting…" : "Format SQL"}
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            disabled={output === "" || isFormatting}
            onClick={handleCopy}
          >
            Copy formatted SQL
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto"
            variant="outline"
            disabled={(source === "" && output === "") || isFormatting}
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>

        <p
          id="sql-result-status"
          className="min-h-5 text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFormatting
            ? "Loading the local formatter and formatting SQL."
            : copyMessage ||
              (result?.status === "success"
                ? "Formatting complete. Source SQL was left unchanged."
                : "")}
        </p>

        {errorResult ? (
          <SqlErrorSummary ref={errorRef} result={errorResult} onRetry={handleFormat} />
        ) : null}

        <aside className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
          <p>{SQL_UPSTREAM_LIMITATION}</p>
          <p>
            This tool changes layout and configured keyword case only. It does not run or connect to
            a database.
          </p>
        </aside>
      </Card>
    </div>
  );
}

interface SqlOptionSelectProps<Value extends string> {
  disabled: boolean;
  id: string;
  label: string;
  onChange: (value: Value) => void;
  options: readonly { label: string; value: Value }[];
  value: Value;
}

function SqlOptionSelect<Value extends string>({
  disabled,
  id,
  label,
  onChange,
  options,
  value,
}: SqlOptionSelectProps<Value>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as Value)}
        className="min-h-touch w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-geist focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60"
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type SqlErrorResult = Exclude<SqlFormatResult, { status: "empty" | "success" }>;

interface SqlErrorSummaryProps {
  onRetry: () => Promise<void>;
  result: SqlErrorResult;
}

const SqlErrorSummary = forwardRef<HTMLDivElement, SqlErrorSummaryProps>(function SqlErrorSummary(
  { onRetry, result },
  ref,
) {
  const retryable = result.status === "load-error" || result.status === "unexpected-error";

  return (
    <div
      ref={ref}
      className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
      aria-label="SQL formatting error"
      role="alert"
      tabIndex={-1}
    >
      <h2 className="font-semibold text-foreground">{getErrorTitle(result)}</h2>
      <p className="leading-6 text-foreground">{result.message}</p>
      {retryable ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try formatting again
        </Button>
      ) : null}
    </div>
  );
});
SqlErrorSummary.displayName = "SqlErrorSummary";

function getErrorTitle(result: SqlErrorResult): string {
  switch (result.status) {
    case "oversized":
      return `SQL is over ${SQL_SIZE_LABEL}`;
    case "unsupported":
      return result.reason === "upstream-limitation"
        ? "This SQL uses an unsupported formatter feature"
        : "Check the SQL and selected dialect";
    case "load-error":
      return "The formatter did not load";
    case "unexpected-error":
      return "Formatting was interrupted";
  }
}
