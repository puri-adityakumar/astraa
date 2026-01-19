"use client";

import { useState, useEffect } from "react";
import { Timer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

export function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? WORK_TIME : BREAK_TIME);
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(WORK_TIME);
    setIsBreak(false);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="glass p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Timer className="h-5 w-5" />
            Pomodoro Timer
          </h2>
          <span className="text-sm text-muted-foreground">
            {isBreak ? "Break Time" : "Work Time"}
          </span>
        </div>

        <div className="py-4 text-center font-mono text-4xl">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={toggleTimer}>{isRunning ? "Pause" : "Start"}</Button>
          <Button variant="outline" onClick={resetTimer}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
