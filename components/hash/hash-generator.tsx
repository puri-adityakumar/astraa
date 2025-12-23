"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { HashInput } from "./hash-input"
import { HashOutput } from "./hash-output"
import { generateHash } from "@/lib/hash"
import { hashAlgorithms } from "@/lib/hash"

export function HashGeneratorClient() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [selectedHash, setSelectedHash] = useState(hashAlgorithms[0]?.id ?? "sha256")
  const [hash, setHash] = useState("")

  const handleGenerateHash = () => {
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter some text to hash",
        variant: "destructive"
      })
      return
    }

    const newHash = generateHash(input, selectedHash)
    setHash(newHash)
  }

  return (
    <div className="container max-w-2xl pt-24 pb-12 space-y-8">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hash Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate secure hash outputs from your text input
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <HashInput
          value={input}
          selectedHash={selectedHash}
          onChange={setInput}
          onHashChange={setSelectedHash}
          onGenerate={handleGenerateHash}
        />
        {hash && (
          <HashOutput
            type={selectedHash}
            hash={hash}
          />
        )}
      </Card>
    </div>
  )
}