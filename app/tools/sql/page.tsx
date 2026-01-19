"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { WorkInProgress } from "@/components/wip";
import { copyToClipboard } from "@/lib/clipboard";

export default function SqlFormatter() {
  const { toast } = useToast();
  const [sql, setSql] = useState("");
  const [formattedSql, setFormattedSql] = useState("");

  const formatSql = () => {
    try {
      // Basic SQL formatting for demonstration
      // In production, you'd want to use a proper SQL formatter
      let formatted = sql
        .replace(/\s+/g, " ")
        .replace(/ ,/g, ",")
        .replace(/\( /g, "(")
        .replace(/ \)/g, ")")
        .replace(/ +/g, " ")
        .trim()
        .replace(/SELECT /gi, "SELECT\n  ")
        .replace(/FROM /gi, "\nFROM\n  ")
        .replace(/WHERE /gi, "\nWHERE\n  ")
        .replace(/ORDER BY /gi, "\nORDER BY\n  ")
        .replace(/GROUP BY /gi, "\nGROUP BY\n  ")
        .replace(/HAVING /gi, "\nHAVING\n  ")
        .replace(/LIMIT /gi, "\nLIMIT\n  ")
        .replace(/AND /gi, "\n  AND ")
        .replace(/OR /gi, "\n  OR ")
        .replace(/JOIN /gi, "\nJOIN\n  ")
        .replace(/LEFT JOIN /gi, "\nLEFT JOIN\n  ")
        .replace(/RIGHT JOIN /gi, "\nRIGHT JOIN\n  ")
        .replace(/INNER JOIN /gi, "\nINNER JOIN\n  ")
        .replace(/ON /gi, "\n  ON ");

      setFormattedSql(formatted);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format SQL. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = async () => {
    const result = await copyToClipboard(formattedSql);
    if (result.success) {
      toast({
        title: "Copied!",
        description: "SQL copied to clipboard",
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
          <h1 className="text-3xl font-bold">SQL Formatter</h1>
          <p className="text-muted-foreground">
            Format and validate SQL queries
          </p>
        </div>

        <Card className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label>Input SQL</Label>
              <Textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                placeholder="Paste your SQL query here..."
                className="min-h-[300px] font-mono"
              />
              <Button className="w-full" onClick={formatSql} disabled={!sql}>
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
              <div className="min-h-[300px] overflow-auto whitespace-pre rounded-md bg-muted p-4 font-mono">
                {formattedSql || "Formatted SQL will appear here"}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </WorkInProgress>
  );
}
