"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/clipboard";

interface ColorDisplayProps {
  color: string;
  label?: string;
  onClick?: () => void;
}

export function ColorDisplay({ color, label, onClick }: ColorDisplayProps) {
  const { toast } = useToast();

  const handleCopyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await copyToClipboard(color);
    if (result.success) {
      toast({
        title: "Copied!",
        description: `${color} copied to clipboard`,
      });
    } else {
      toast({
        title: "Copy failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg"
      onClick={onClick}
    >
      <div className="aspect-square" style={{ backgroundColor: color }} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleCopyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
        {label && <p className="font-mono text-white">{label}</p>}
      </div>
    </div>
  );
}
