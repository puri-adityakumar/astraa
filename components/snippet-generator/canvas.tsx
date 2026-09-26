"use client";

import { forwardRef } from "react";
import { BackgroundLayer } from "./background-layer";
import { Frame } from "./frame";
import { CodePreview } from "./code-preview";
import { ScreenshotPreview } from "./screenshot-preview";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

export const Canvas = forwardRef<HTMLDivElement>((_, ref) => {
  const s = useSnippetGenerator();

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[1200px] mx-auto"
      style={{ aspectRatio: `${s.aspect.w} / ${s.aspect.h}` }}
    >
      <BackgroundLayer bg={s.background} />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ padding: s.padding }}
      >
        <Frame
          chrome={s.windowChrome}
          filename={s.filename}
          onFilenameChange={s.setFilename}
          dropShadow={s.dropShadow}
        >
          {s.mode === "code" ? (
            <CodePreview
              code={s.code}
              language={s.language}
              theme={s.theme}
              fontFamily={s.font.family}
              fontSize={s.font.size}
              padding={s.padding}
              lineNumbers={s.lineNumbers}
              onChange={s.setCode}
            />
          ) : (
            <ScreenshotPreview
              dataUrl={s.screenshotDataUrl}
              onChange={s.setScreenshot}
              padding={s.padding}
            />
          )}
        </Frame>
      </div>
    </div>
  );
});
Canvas.displayName = "Canvas";
