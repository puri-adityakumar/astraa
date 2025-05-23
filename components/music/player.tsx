"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([0.5])
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
    if (audioRef.current) {
      audioRef.current.volume = value[0]
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
      
      <div className="relative z-20 p-6">
        <div className="flex justify-center mb-6">
          <div className="relative w-64 h-64 rounded-lg overflow-hidden">
            {isPlaying ? (
              <Image
                src="https://i.pinimg.com/originals/38/29/78/382978fee601e09a59a05a8eb5e84a3e.gif"
                alt="Lofi Animation"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Lofi Beats</h2>
            <p className="text-sm text-muted-foreground">Focus & Relax</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="rounded-full"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Button
              size="icon"
              onClick={togglePlay}
              className="h-12 w-12 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>

            <div className="w-24">
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="https://stream.nightride.fm/chillsynth.m4a"
        loop
      />
    </Card>
  )
}