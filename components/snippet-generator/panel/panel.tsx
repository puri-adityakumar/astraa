// components/snippet-generator/panel/panel.tsx
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Palette, Monitor, Type, LayoutGrid, Share2, Image as ImageIcon } from "lucide-react";
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

type GroupProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
};

function Group({ icon, title, children }: GroupProps) {
  return (
    <section className="px-4 py-5 border-b last:border-b-0">
      <h3 className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-muted-foreground/70" aria-hidden>
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function PanelBody({ getCanvasNode }: Props) {
  const mode = useSnippetGenerator((s) => s.mode);

  return (
    <div className="w-full">
      <Group icon={<Palette className="h-3.5 w-3.5" />} title="Background">
        <BgSection />
      </Group>
      <Group icon={<Monitor className="h-3.5 w-3.5" />} title="Window">
        <WindowSection />
      </Group>
      {mode === "code" && (
        <Group icon={<ImageIcon className="h-3.5 w-3.5" />} title="Theme & language">
          <ThemeSection />
        </Group>
      )}
      {mode === "code" && (
        <Group icon={<Type className="h-3.5 w-3.5" />} title="Font">
          <FontSection />
        </Group>
      )}
      <Group icon={<LayoutGrid className="h-3.5 w-3.5" />} title="Layout">
        <LayoutSection />
      </Group>
      <Group icon={<Share2 className="h-3.5 w-3.5" />} title="Export">
        <ExportSection getNode={getCanvasNode} />
      </Group>
    </div>
  );
}

export function DesktopPanel(props: Props) {
  return (
    <aside
      className="hidden lg:block w-[320px] border-l bg-muted/30 overflow-y-auto"
      aria-label="Customize panel"
    >
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
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto p-0">
        <SheetHeader className="px-4 py-4 border-b">
          <SheetTitle>Customize</SheetTitle>
        </SheetHeader>
        <PanelBody {...props} />
      </SheetContent>
    </Sheet>
  );
}
