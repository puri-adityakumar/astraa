"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Base64Mode, Base64Options } from "@/lib/base64";

export interface Base64OptionsProps {
  mode: Base64Mode;
  options: Base64Options;
  onChange: (next: Base64Options) => void;
}

export function Base64OptionsRow({
  mode,
  options,
  onChange,
}: Base64OptionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
      <div className="flex items-center gap-2 min-h-touch">
        <Checkbox
          id="base64-url-safe"
          checked={options.urlSafe}
          onCheckedChange={(checked) =>
            onChange({ ...options, urlSafe: checked === true })
          }
        />
        <Label htmlFor="base64-url-safe" className="cursor-pointer">
          URL-safe (RFC 4648 §5)
        </Label>
      </div>
      {mode === "encode" && (
        <div className="flex items-center gap-2 min-h-touch">
          <Checkbox
            id="base64-wrap-76"
            checked={options.wrap76}
            onCheckedChange={(checked) =>
              onChange({ ...options, wrap76: checked === true })
            }
          />
          <Label htmlFor="base64-wrap-76" className="cursor-pointer">
            Wrap at 76 chars (MIME)
          </Label>
        </div>
      )}
    </div>
  );
}
