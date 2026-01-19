"use client";

import { RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface TransformControlsProps {
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  onRotationChange: (value: number) => void;
  onFlipHorizontalChange: (value: boolean) => void;
  onFlipVerticalChange: (value: boolean) => void;
}

export function TransformControls({
  rotation,
  flipHorizontal,
  flipVertical,
  onRotationChange,
  onFlipHorizontalChange,
  onFlipVerticalChange,
}: TransformControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Rotation: {rotation}°</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[rotation]}
            onValueChange={([value]) =>
              value !== undefined && onRotationChange(value)
            }
            min={0}
            max={360}
            step={90}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRotationChange((rotation + 90) % 360)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlipHorizontal className="h-4 w-4" />
          <Label>Flip Horizontal</Label>
        </div>
        <Switch
          checked={flipHorizontal}
          onCheckedChange={onFlipHorizontalChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlipVertical className="h-4 w-4" />
          <Label>Flip Vertical</Label>
        </div>
        <Switch checked={flipVertical} onCheckedChange={onFlipVerticalChange} />
      </div>
    </div>
  );
}
