"use client"

import { useState } from "react"
import { PasswordOptions } from "./password-options"
import { PasswordDisplay } from "./password-display"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { generatePassword } from "@/lib/password/password-utils"

export function PasswordGeneratorClient() {
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([12])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })

  const handleGeneratePassword = () => {
    const result = generatePassword(length[0] ?? 12, options)
    if (result.success) {
      setPassword(result.password)
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Password Generator</h1>
        <p className="text-muted-foreground">
          Generate secure passwords with customizable options
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <PasswordDisplay password={password} />
        <PasswordOptions
          length={length}
          options={options}
          onLengthChange={setLength}
          onOptionsChange={setOptions}
        />
        <Button className="w-full" onClick={handleGeneratePassword}>
          Generate Password
        </Button>
      </Card>
    </div>
  )
}