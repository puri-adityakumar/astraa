"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

import { useReducedMotion } from "@/lib/animations/hooks";

const PixelBlast = dynamic(() => import("@/components/ui/pixel-blast"), {
  ssr: false,
});

let capableGPU: boolean | undefined;

function hasCapableGPU(): boolean {
  if (capableGPU !== undefined) return capableGPU;
  capableGPU = false;
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    capableGPU = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return false;
  }
  return capableGPU;
}

function subscribeViewport(onChange: () => void): () => void {
  window.addEventListener("resize", onChange, { passive: true });
  return () => window.removeEventListener("resize", onChange);
}

function getCapabilitySnapshot(): boolean {
  return window.innerWidth >= 768 && hasCapableGPU();
}

function getServerSnapshot(): boolean {
  return false;
}

export function LandingBackground() {
  const { resolvedTheme } = useTheme();
  const canRender = useSyncExternalStore(
    subscribeViewport,
    getCapabilitySnapshot,
    getServerSnapshot,
  );
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const shouldRender = pathname === "/" && canRender && !reducedMotion;

  useEffect(() => {
    if (!shouldRender || !containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? false),
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [shouldRender]);

  if (!shouldRender) return null;

  const pixelColor = resolvedTheme === "dark" ? "#B19EEF" : "#22c55e";

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 pointer-events-none">
      {isVisible && (
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color={pixelColor}
          patternScale={1}
          patternDensity={0.55}
          pixelSizeJitter={0}
          enableRipples={false}
          liquid
          liquidStrength={0.1}
          liquidRadius={1}
          liquidWobbleSpeed={4.5}
          speed={0.5}
          edgeFade={0.25}
          transparent
        />
      )}
    </div>
  );
}
