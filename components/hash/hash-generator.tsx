"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { HashInput } from "./hash-input";
import { HashOutput } from "./hash-output";
import { generateHash } from "@/lib/hash";
import { hashAlgorithms } from "@/lib/hash";

export function HashGeneratorClient() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [selectedHash, setSelectedHash] = useState(hashAlgorithms[0]?.id ?? "sha256");
  const [hash, setHash] = useState("");

  const handleGenerateHash = () => {
    if (!input) {
      toast({
        title: "Error",
        description: "Please enter some text to hash",
        variant: "destructive",
      });
      return;
    }

    const newHash = generateHash(input, selectedHash);
    setHash(newHash);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div className="space-y-3 border-b pb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Hash Generator
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Generate MD5, SHA-1, SHA-2, or SHA-3 digests for checksum comparison.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          Text is processed in this browser
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-6">
        <HashInput
          value={input}
          selectedHash={selectedHash}
          onChange={setInput}
          onHashChange={setSelectedHash}
          onGenerate={handleGenerateHash}
        />
        {hash && <HashOutput type={selectedHash} hash={hash} />}
      </Card>
    </div>
  );
}
