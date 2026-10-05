"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { ToolSlug } from "@/lib/terminal/types";

/** Props panel variants of tool clients accept. */
export type PanelClientProps = { variant?: "page" | "panel" };

/**
 * Loading placeholder shown while a panel's client chunk downloads. The
 * marker lets checks assert the real client has replaced it.
 */
export function PanelLoading() {
  return (
    <p
      data-term-panel-loading
      className="py-6 font-mono text-sm text-term-muted"
    >
      loading…
    </p>
  );
}

const CalculatorClient = dynamic(
  () =>
    import("@/components/calculator/calculator-client").then(
      (m) => m.CalculatorClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const UnitsClient = dynamic(
  () =>
    import("@/components/units/unit-converter").then(
      (m) => m.UnitConverterClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const Base64ClientPanel = dynamic(
  () =>
    import("@/components/base64/base64-client").then((m) => m.Base64Client),
  { ssr: false, loading: PanelLoading },
);

const HashClient = dynamic(
  () =>
    import("@/components/hash/hash-generator").then(
      (m) => m.HashGeneratorClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const RegexTesterPanel = dynamic(
  () =>
    import("@/components/regex-tester/regex-tester-client").then(
      (m) => m.RegexTesterClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const JsonEditorPanel = dynamic(
  () =>
    import("@/components/json/json-editor-client").then(
      (m) => m.JsonEditorClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const PasswordGeneratorPanel = dynamic(
  () =>
    import("@/components/password/password-generator").then(
      (m) => m.PasswordGeneratorClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const CurrencyConverterPanel = dynamic(
  () =>
    import("@/components/currency/currency-converter").then(
      (m) => m.CurrencyConverterClient,
    ),
  { ssr: false, loading: PanelLoading },
);

const LoremGeneratorPanel = dynamic(
  () =>
    import("@/components/text/text-generator-client").then(
      (m) => m.TextGeneratorClient,
    ),
  { ssr: false, loading: PanelLoading },
);

/**
 * ToolSlug → dynamically imported tool client (one entry per registered
 * tool). Heavy clients only load when their panel opens; the Record type
 * forces a new slug to add its mapping here.
 */
export const PANEL_CLIENTS: Record<ToolSlug, ComponentType<PanelClientProps>> = {
  calculator: CalculatorClient,
  units: UnitsClient,
  base64: Base64ClientPanel,
  hash: HashClient,
  regex: RegexTesterPanel,
  json: JsonEditorPanel,
  password: PasswordGeneratorPanel,
  currency: CurrencyConverterPanel,
  text: LoremGeneratorPanel,
};
