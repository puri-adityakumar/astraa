"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Star, Users } from "lucide-react";

interface Stats {
  visitors: number;
  stars: number;
  contributors: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setStats(data);
        }
      })
      .catch(() => {
        // Silent fail
      });
  }, []);

  if (!stats) {
    return null;
  }

  const items = [
    { label: "visitors", value: stats.visitors, icon: Eye },
    { label: "stars", value: stats.stars, icon: Star },
    { label: "contributors", value: stats.contributors, icon: Users },
  ];

  return (
    <motion.div
      variants={fadeInUp}
      className="mt-2 flex flex-wrap items-center justify-center gap-6 text-base text-muted-foreground"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <span className="mx-3 text-muted-foreground/30">•</span>
            )}
            <Icon className="h-4 w-4 text-muted-foreground/70" />
            <span className="font-semibold tabular-nums text-foreground">
              {formatNumber(item.value)}
            </span>
            <span className="text-muted-foreground/80">{item.label}</span>
          </span>
        );
      })}
    </motion.div>
  );
}
