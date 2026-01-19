"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface PopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Popup({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: PopupProps) {
  // Prevent background scrolling when popup is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("gap-0 p-0 outline-none sm:max-w-[425px]", className)}
      >
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

interface ComingSoonPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: string;
}

export function ComingSoonPopup({
  open,
  onOpenChange,
  feature,
}: ComingSoonPopupProps) {
  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title={`${feature} - Coming Soon`}
      description="We're working hard to bring you this feature"
    >
      <div className="space-y-6 p-6 pt-2">
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <p className="text-center text-sm text-muted-foreground">
            This feature is currently under development. We'll notify you as
            soon as it's ready!
          </p>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      </div>
    </Popup>
  );
}
