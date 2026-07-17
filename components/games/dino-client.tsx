"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Globe } from "lucide-react";
import { WorkInProgress } from "@/components/wip";
import { useReducedMotion } from "@/lib/animations/hooks";
import { DinoOriginal } from "@/components/games/dino-original";
import { DinoCustomGame } from "@/components/games/dino-custom-game";

export function DinoClient() {
  const [mode, setMode] = useState<"custom" | "original">("original");
  const shouldReduce = useReducedMotion();

  return (
    <WorkInProgress>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          className="text-center space-y-4"
          initial={shouldReduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.5 }}
        >
          <h1 className="text-4xl font-bold">Chrome Dino</h1>
          <p className="text-muted-foreground">
            The famous Chrome dinosaur game. Choose between the original or our custom version!
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={mode === "original" ? "default" : "outline"}
              onClick={() => setMode("original")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Original
            </Button>
            <Button
              variant={mode === "custom" ? "default" : "outline"}
              onClick={() => setMode("custom")}
              className="gap-2"
            >
              <Gamepad2 className="h-4 w-4" />
              Custom
            </Button>
          </div>
        </motion.div>

        {mode === "original" ? <DinoOriginal /> : <DinoCustomGame />}

        <div className="text-center text-sm text-muted-foreground">
          {mode === "custom" ? (
            <p>Tip: Use the spacebar to jump, or click/tap the game area</p>
          ) : (
            <p>Tip: Press Space to start and jump. The game works just like in Chrome!</p>
          )}
        </div>
      </div>
    </WorkInProgress>
  );
}
