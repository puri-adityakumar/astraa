"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { WorkInProgress } from "@/components/wip";
import { copyToClipboard } from "@/lib/clipboard";

export default function JsonValidator() {
  const { toast } = useToast();
  const [json, setJson] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [formattedJson, setFormattedJson] = useState("");

  const validateAndFormat = () => {
    try {
      const parsed = JSON.parse(json);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Invalid JSON",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    const result = await copyToClipboard(formattedJson);
    if (result.success) {
      toast({
        title: "Copied!",
        description: "JSON copied to clipboard",
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
    <WorkInProgress>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">JSON Validator</h1>
          <p className="text-muted-foreground">Validate and format JSON data</p>
        </div>

        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Input JSON</Label>
                {isValid !== null && (
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={isValid ? "text-green-500" : "text-red-500"}
                    >
                      {isValid ? "Valid JSON" : "Invalid JSON"}
                    </span>
                  </div>
                )}
              </div>
              <Textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                placeholder="Paste your JSON here..."
                className="min-h-[300px] font-mono"
              />
              <Button
                className="w-full"
                onClick={validateAndFormat}
                disabled={!json}
              >
                Validate & Format
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Formatted JSON</Label>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  disabled={!formattedJson}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-[300px] overflow-auto whitespace-pre rounded-md bg-muted p-4 font-mono">
                {formattedJson || "Formatted JSON will appear here"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </WorkInProgress>
  );
}
