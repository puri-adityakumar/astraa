"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer, RefreshCw } from "lucide-react"

const WORK_TIME = 25 * 60 // 25 minutes in seconds
const BREAK_TIME = 5 * 60 // 5 minutes in seconds

export function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const interval = window.setInterval(() => {
      setTimeLeft((time) => {
        if (time > 1) return time - 1

        const nextIsBreak = !isBreak
        setIsBreak(nextIsBreak)
        setIsRunning(false)
        return nextIsBreak ? BREAK_TIME : WORK_TIME
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, isBreak])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setTimeLeft(WORK_TIME)
    setIsBreak(false)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-6 glass">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Pomodoro Timer
          </h2>
          <span className="text-sm text-muted-foreground">
            {isBreak ? "Break Time" : "Work Time"}
          </span>
        </div>

        <div className="text-4xl font-mono text-center py-4">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={toggleTimer}>
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" onClick={resetTimer}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
