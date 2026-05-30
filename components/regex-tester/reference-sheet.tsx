"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ReferencePanel } from "./reference-panel";

export interface ReferenceSheetProps {
  onInsertAtCaret: (text: string) => void;
}

export function ReferenceSheet({ onInsertAtCaret }: ReferenceSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open reference"
          className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg sm:hidden"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Reference</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ReferencePanel
            onInsertAtCaret={(text) => {
              onInsertAtCaret(text);
              setOpen(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
