"use client"

import { MusicPlayer } from "@/components/music/player"
import { Pomodoro } from "@/components/music/pomodoro"
import { TodoList } from "@/components/music/todo"
import { WorkInProgress } from "@/components/wip"

export default function LofiPage() {
  return (
    <WorkInProgress>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Lofi Focus Studio</h1>
          <p className="text-muted-foreground">
            Stay productive with lofi beats, pomodoro timer, and task management
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <MusicPlayer />

          <div className="space-y-8">
            <Pomodoro />
            <TodoList />
          </div>
        </div>
      </div>
    </WorkInProgress>
  )
}