"use client";

import { useState, useEffect } from "react";
import type { CropArea } from "@/lib/image/types";

interface CropOverlayProps {
  enabled: boolean;
  containerSize: { width: number; height: number };
  onCropChange: (crop: CropArea) => void;
}

export function CropOverlay({
  enabled,
  containerSize,
  onCropChange,
}: CropOverlayProps) {
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: containerSize.width,
    height: containerSize.height,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    onCropChange(crop);
  }, [crop, onCropChange]);

  if (!enabled) return null;

  return (
    <div
      className="absolute inset-0 cursor-move"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        setDragStart({
          x: e.clientX - crop.x,
          y: e.clientY - crop.y,
        });
      }}
      onMouseMove={(e) => {
        if (!isDragging) return;

        const newX = Math.max(
          0,
          Math.min(e.clientX - dragStart.x, containerSize.width - crop.width),
        );
        const newY = Math.max(
          0,
          Math.min(e.clientY - dragStart.y, containerSize.height - crop.height),
        );

        setCrop((prev) => ({
          ...prev,
          x: newX,
          y: newY,
        }));
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <div
        className="absolute border-2 border-white"
        style={{
          left: crop.x,
          top: crop.y,
          width: crop.width,
          height: crop.height,
        }}
      />
    </div>
  );
}
