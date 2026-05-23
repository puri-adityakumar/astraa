// components/snippet-generator/panel/panel.tsx
"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BgSection } from "./bg-section";
import { WindowSection } from "./window-section";
import { ThemeSection } from "./theme-section";
import { FontSection } from "./font-section";
import { LayoutSection } from "./layout-section";
import { ExportSection } from "./export-section";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

type Props = {
  getCanvasNode: () => HTMLElement | null;
};

function PanelBody({ getCanvasNode }: Props) {
  const mode = useSnippetGenerator((s) => s.mode);

  return (
    <Accordion type="multiple" defaultValue={["bg"]} className="w-full">
      <AccordionItem value="bg">
        <AccordionTrigger>Background</AccordionTrigger>
        <AccordionContent><BgSection /></AccordionContent>
      </AccordionItem>
      <AccordionItem value="window">
        <AccordionTrigger>Window</AccordionTrigger>
        <AccordionContent><WindowSection /></AccordionContent>
      </AccordionItem>
      {mode === "code" && (
        <AccordionItem value="theme">
          <AccordionTrigger>Theme & Language</AccordionTrigger>
          <AccordionContent><ThemeSection /></AccordionContent>
        </AccordionItem>
      )}
      {mode === "code" && (
        <AccordionItem value="font">
          <AccordionTrigger>Font</AccordionTrigger>
          <AccordionContent><FontSection /></AccordionContent>
        </AccordionItem>
      )}
      <AccordionItem value="layout">
        <AccordionTrigger>Layout</AccordionTrigger>
        <AccordionContent><LayoutSection /></AccordionContent>
      </AccordionItem>
      <AccordionItem value="export">
        <AccordionTrigger>Export</AccordionTrigger>
        <AccordionContent>
          <ExportSection getNode={getCanvasNode} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function DesktopPanel(props: Props) {
  return (
    <aside className="hidden lg:block w-[320px] border-l overflow-y-auto p-4">
      <PanelBody {...props} />
    </aside>
  );
}

export function MobilePanelTrigger(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="lg:hidden fixed bottom-4 right-4 z-50 shadow-lg">
          Customize
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Customize</SheetTitle>
        </SheetHeader>
        <div className="pt-4">
          <PanelBody {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
