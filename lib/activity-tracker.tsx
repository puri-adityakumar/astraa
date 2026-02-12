"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { tools } from './tools'
import { games } from './games'

interface Activity {
  id: string
  type: 'tool' | 'game'
  name: string
  icon: string
  timestamp: Date
  location: string
}

interface ActivityStats {
  totalUsage: number
  popularTools: Array<{ name: string; count: number; icon: string }>
  recentActivities: Activity[]
  activeUsers: number
}

interface ActivityContextType {
  stats: ActivityStats
  trackActivity: (type: 'tool' | 'game', name: string) => void
}

const ActivityContext = createContext<ActivityContextType>({
  stats: {
    totalUsage: 0,
    popularTools: [],
    recentActivities: [],
    activeUsers: 0
  },
  trackActivity: () => {}
})

// Simulated locations for demo
const locations = [
  'New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney', 'Toronto',
  'Mumbai', 'São Paulo', 'Singapore', 'Dubai', 'Amsterdam', 'Stockholm'
]

// Pre-compute combined items array once at module level
const allItems = [...tools, ...games]
const gameNames = new Set(games.map(g => g.name))

// Generate realistic demo data
const generateDemoActivity = (): Activity | null => {
  const randomItem = allItems[Math.floor(Math.random() * allItems.length)]

  if (!randomItem) return null

  const isGame = gameNames.has(randomItem.name)
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: isGame ? 'game' : 'tool',
    name: randomItem.name,
    icon: randomItem.icon.name || 'Circle',
    timestamp: new Date(Date.now() - Math.random() * 3600000), // Last hour
    location: locations[Math.floor(Math.random() * locations.length)] ?? 'Unknown'
  }
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<ActivityStats>(() => {
    // Initialize with demo data
    const activities = Array.from({ length: 20 }, generateDemoActivity).filter((a): a is Activity => a !== null)
    const toolCounts = new Map<string, { count: number; icon: string }>()
    
    activities.forEach(activity => {
      const current = toolCounts.get(activity.name) || { count: 0, icon: activity.icon }
      toolCounts.set(activity.name, { ...current, count: current.count + 1 })
    })
    
    const popularTools = Array.from(toolCounts.entries())
      .map(([name, data]) => ({ name, count: data.count, icon: data.icon }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return {
      totalUsage: 1247 + activities.length,
      popularTools,
      recentActivities: activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
      activeUsers: 23 + Math.floor(Math.random() * 15)
    }
  })

  const trackActivity = useCallback((type: 'tool' | 'game', name: string) => {
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name,
      icon: 'Circle',
      timestamp: new Date(),
      location: locations[Math.floor(Math.random() * locations.length)] ?? 'Unknown'
    }

    setStats(prev => ({
      ...prev,
      totalUsage: prev.totalUsage + 1,
      recentActivities: [newActivity, ...prev.recentActivities].slice(0, 10)
    }))
  }, [])

  // Simulate real-time activity (pauses when tab is hidden)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    const startPolling = () => {
      interval = setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance every 3 seconds
          const newActivity = generateDemoActivity()
          if (newActivity) {
            setStats(prev => ({
              ...prev,
              totalUsage: prev.totalUsage + 1,
              recentActivities: [newActivity, ...prev.recentActivities].slice(0, 10),
              activeUsers: Math.max(15, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1))
            }))
          }
        }
      }, 3000)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval)
      } else {
        startPolling()
      }
    }

    startPolling()
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const contextValue = useMemo(() => ({ stats, trackActivity }), [stats, trackActivity])

  return (
    <ActivityContext.Provider value={contextValue}>
      {children}
    </ActivityContext.Provider>
  )
}

export const useActivity = () => useContext(ActivityContext)