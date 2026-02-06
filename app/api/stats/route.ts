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
        // Fetch repo info and contributors in parallel
        const [repoResponse, contributorsResponse] = await Promise.all([
            fetch(
                'https://api.github.com/repos/puri-adityakumar/astraa',
                { next: { revalidate: 300 } }
            ),
            fetch(
                'https://api.github.com/repos/puri-adityakumar/astraa/contributors?per_page=100',
                { next: { revalidate: 300 } }
            ),
        ])

        if (!repoResponse.ok || !contributorsResponse.ok) {
            throw new Error('GitHub API request failed')
        }

        const [repoData, contributorsData] = await Promise.all([
            repoResponse.json(),
            contributorsResponse.json(),
        ])

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
    // Fetch Redis visitor count and GitHub stats in parallel
    const [visitorsResult, githubResult] = await Promise.allSettled([
        redis.get<number>(REDIS_KEYS.VISITOR_COUNT),
        getGitHubStats(),
    ])

    const visitors = visitorsResult.status === 'fulfilled' ? (visitorsResult.value || 0) : 0
    const { stars, contributors } = githubResult.status === 'fulfilled'
        ? githubResult.value
        : { stars: 0, contributors: 0 }

    if (visitorsResult.status === 'rejected') {
        console.error('Failed to fetch visitor count from Redis:', visitorsResult.reason)
    }

    return NextResponse.json({
        visitors,
        stars,
        contributors,
    })
}
