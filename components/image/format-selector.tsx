"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ImageFormat } from "@/lib/image/types";

interface FormatSelectorProps {
  format: ImageFormat;
  onFormatChange: (format: ImageFormat) => void;
}

export function FormatSelector({
  format,
  onFormatChange,
}: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Format</Label>
      <Select
        value={format}
        onValueChange={(value) => onFormatChange(value as ImageFormat)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="image/jpeg">JPEG</SelectItem>
          <SelectItem value="image/png">PNG</SelectItem>
          <SelectItem value="image/webp">WebP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
