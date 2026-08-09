"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-6 min-h-6 w-11 shrink-0 cursor-pointer items-center " +
        "rounded-full border border-input transition-colors after:absolute after:-inset-y-2.5 " +
        "after:-inset-x-0.5 focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
        "disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary " +
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 translate-x-1 rounded-full bg-background " +
          "shadow-geist ring-0 transition-transform data-[state=checked]:translate-x-6",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
