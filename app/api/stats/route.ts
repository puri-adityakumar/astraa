import { NextResponse } from 'next/server'
import { redis, REDIS_KEYS } from '@/lib/redis'

// Cache GitHub data for 5 minutes
let githubCache: { stars: number; contributors: number; timestamp: number } | null = null
const GITHUB_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getGitHubStats() {
    // Check cache
    if (githubCache && Date.now() - githubCache.timestamp < GITHUB_CACHE_TTL) {
        return { stars: githubCache.stars, contributors: githubCache.contributors }
    }

    try {
        // Fetch repo info for stars
        const repoResponse = await fetch(
            'https://api.github.com/repos/puri-adityakumar/astraa',
            { next: { revalidate: 300 } } // Cache for 5 minutes
        )

        // Fetch contributors
        const contributorsResponse = await fetch(
            'https://api.github.com/repos/puri-adityakumar/astraa/contributors?per_page=100',
            { next: { revalidate: 300 } }
        )

        if (!repoResponse.ok || !contributorsResponse.ok) {
            throw new Error('GitHub API request failed')
        }

        const repoData = await repoResponse.json()
        const contributorsData = await contributorsResponse.json()

        const stars = repoData.stargazers_count || 0
        const contributors = Array.isArray(contributorsData) ? contributorsData.length : 0

        // Update cache
        githubCache = { stars, contributors, timestamp: Date.now() }

        return { stars, contributors }
    } catch (error) {
        console.error('Failed to fetch GitHub stats:', error)
        // Return cached data if available, otherwise zeros
        return githubCache
            ? { stars: githubCache.stars, contributors: githubCache.contributors }
            : { stars: 0, contributors: 0 }
    }
}

export async function GET() {
    // Fetch visitor count from Redis (with fallback)
    let visitors = 0
    try {
        visitors = await redis.get<number>(REDIS_KEYS.VISITOR_COUNT) || 0
    } catch (error) {
        console.error('Failed to fetch visitor count from Redis:', error)
        // Continue with visitors = 0
    }

    // Fetch GitHub stats (has its own error handling)
    const { stars, contributors } = await getGitHubStats()

    return NextResponse.json({
        visitors,
        stars,
        contributors,
    })
}
