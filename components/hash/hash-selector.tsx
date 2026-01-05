"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { hashAlgorithms } from "@/lib/hash"

interface HashSelectorProps {
  selectedHash: string
  onHashChange: (value: string) => void
}

export function HashSelector({ selectedHash, onHashChange }: HashSelectorProps) {
  const selectedAlgorithm = hashAlgorithms.find(algo => algo.id === selectedHash)

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedHash} onValueChange={onHashChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Select hash type" />
        </SelectTrigger>
        <SelectContent>
          {hashAlgorithms.map((algo) => (
            <SelectItem key={algo.id} value={algo.id}>
              {algo.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedAlgorithm && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{selectedAlgorithm.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}