"use client";

import { Card } from "@/components/ui/card";

export function DinoOriginal() {
  return (
    <Card className="aspect-[2/1] relative overflow-hidden">
      <iframe
        src="https://chromedino.com/"
        className="absolute inset-0 w-full h-full"
        style={{ border: "none" }}
      />
    </Card>
  );
}
