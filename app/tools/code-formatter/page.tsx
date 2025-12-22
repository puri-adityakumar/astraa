"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

const languages = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
  { id: "json", name: "JSON" }
]

export default function CodeFormatter() {
  const { toast } = useToast()
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [formattedCode, setFormattedCode] = useState("")

  const formatCode = () => {
    try {
      let formatted = code

      // Basic formatting for demonstration
      // In production, you'd want to use proper formatters like prettier
      if (language === "javascript" || language === "typescript") {
        formatted = formatted
          .replace(/([{}\[\]])/g, "\n$1\n")
          .replace(/;/g, ";\n")
          .split("\n")
          .map(line => line.trim())
          .filter(line => line)
          .join("\n")
      } else if (language === "html") {
        formatted = formatted
          .replace(/></g, ">\n<")
          .replace(/([<>])/g, "\n$1\n")
          .split("\n")
          .map(line => line.trim())
          .filter(line => line)
          .join("\n")
      }

      setFormattedCode(formatted)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to format code. Please check your input.",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formattedCode)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard"
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Code Formatter</h1>
        <p className="text-muted-foreground">
          Format and beautify your code snippets
        </p>
      </div>

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Input Code</Label>
              <Select
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="font-mono min-h-[300px]"
            />
            <Button
              className="w-full"
              onClick={formatCode}
              disabled={!code}
            >
              Format Code
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Formatted Code</Label>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={!formattedCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-[300px] p-4 bg-muted rounded-md font-mono whitespace-pre overflow-auto">
              {formattedCode || "Formatted code will appear here"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}