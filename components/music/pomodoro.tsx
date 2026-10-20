"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer, RefreshCw } from "lucide-react"

const WORK_TIME = 25 * 60 // 25 minutes in seconds
const BREAK_TIME = 5 * 60 // 5 minutes in seconds

export function Pomodoro() {
  const [timer, setTimer] = useState({
    timeLeft: WORK_TIME,
    isRunning: false,
    isBreak: false,
  });
  const { timeLeft, isRunning, isBreak } = timer;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (!prev.isRunning) return prev;
        if (prev.timeLeft <= 1) {
          return {
            timeLeft: prev.isBreak ? WORK_TIME : BREAK_TIME,
            isBreak: !prev.isBreak,
            isRunning: false,
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(interval)
  }, [isRunning])

  const toggleTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  }

  const resetTimer = () => {
    setTimer({ timeLeft: WORK_TIME, isBreak: false, isRunning: false });
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