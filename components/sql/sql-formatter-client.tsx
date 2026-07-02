"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { formatSql } from "@/lib/sql/format";
import { WorkInProgress } from "@/components/wip";

export function SqlFormatterClient() {
  const { toast } = useToast();
  const copy = useCopyToClipboard();
  const [sql, setSql] = useState("");
  const [formattedSql, setFormattedSql] = useState("");

  const handleFormat = () => {
    try {
      setFormattedSql(formatSql(sql));
    } catch {
      toast({
        title: "Error",
        description: "Failed to format SQL. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    await copy(formattedSql, "Copied!");
  };

  return (
    <WorkInProgress>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">SQL Formatter</h1>
          <p className="text-muted-foreground">Format and validate SQL queries</p>
        </div>

        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label>Input SQL</Label>
              <Textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder="Paste your SQL query here..."
                className="font-mono min-h-[300px]"
              />
              <Button className="w-full" onClick={handleFormat} disabled={!sql}>
                Format SQL
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Formatted SQL</Label>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyToClipboard}
                  disabled={!formattedSql}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-[300px] p-4 bg-muted rounded-md font-mono whitespace-pre overflow-auto">
                {formattedSql || "Formatted SQL will appear here"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </WorkInProgress>
  );
}
