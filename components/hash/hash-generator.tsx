"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { generateHash } from "@/lib/hash";
import { hashAlgorithms } from "@/lib/hash";
import { HashInput } from "./hash-input";
import { HashOutput } from "./hash-output";

export function HashGeneratorClient() {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [selectedHash, setSelectedHash] = useState(
    hashAlgorithms[0]?.id ?? "sha256",
  );
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
    <div className="container max-w-2xl space-y-8 px-4 pb-12 pt-24 sm:px-6">
      <div className="space-y-4 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Hash Generator
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Generate secure hash outputs from your text input
        </p>
      </div>

      <Card className="space-y-6 p-4 sm:p-6">
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
