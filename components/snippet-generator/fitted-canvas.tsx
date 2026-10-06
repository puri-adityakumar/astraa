// components/snippet-generator/fitted-canvas.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { BackgroundLayer } from "./background-layer";
import { Frame } from "./frame";
import { CodePreview } from "./code-preview";
import { ScreenshotPreview } from "./screenshot-preview";
import { fittedDisplaySize } from "@/lib/snippet-generator/capture";
import { useSnippetGenerator } from "@/lib/stores/snippet-generator";

const DISPLAY_MAX_HEIGHT = 560;

type Props = {
  captureRef: RefObject<HTMLDivElement | null>;
};

/**
 * Terminal panel composition: the snippet is laid out at its canonical
 * selected size (aspect.w × aspect.h) and the finished composition is scaled
 * to fit the host column. The scaled wrapper only affects the display —
 * exports target the composition's own size, never this transformed bounds.
 */
export function FittedCanvas({ captureRef }: Props) {
  const s = useSnippetGenerator();
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const measure = () => setHostWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fit = fittedDisplaySize(hostWidth, DISPLAY_MAX_HEIGHT, s.aspect);

  return (
    <div ref={hostRef} className="relative w-full" style={{ height: fit.height }}>
      <div
        style={{
          width: fit.width,
          height: fit.height,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: s.aspect.w,
            height: s.aspect.h,
            transform: `scale(${fit.scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={captureRef}
            className="relative overflow-hidden"
            style={{ width: s.aspect.w, height: s.aspect.h }}
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
        </div>
      </div>
    </div>
  );
}
