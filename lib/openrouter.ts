'use server';

import { headers } from 'next/headers';

import { OpenRouter } from '@openrouter/sdk';

import { getUserFriendlyError } from '@/lib/error-handler';
import { rateLimit } from '@/lib/rate-limit';

const MAX_TOPIC_LENGTH = 500;
const MIN_WORD_COUNT = 10;
const MAX_WORD_COUNT = 5000;

// Per-IP rate limits: a short burst window plus a daily cap to protect the
// shared OPENROUTER_API_KEY from abuse.
const RATE_LIMIT_NAMESPACE = 'openrouter:generate';
const RATE_LIMIT_WINDOWS = [
    { windowSeconds: 60, limit: 5 },
    { windowSeconds: 60 * 60 * 24, limit: 50 },
];

// Derive a stable client key from the request IP. Uses the first hop of
// x-forwarded-for and falls back to a constant when no IP is available so the
// limiter still applies a shared (conservative) bucket rather than failing open.
async function getClientKey(): Promise<string> {
    try {
        const headerList = await headers();
        const forwardedFor = headerList.get('x-forwarded-for');
        const firstHop = forwardedFor?.split(',')[0]?.trim();
        if (firstHop) {
            return firstHop;
        }
        const realIp = headerList.get('x-real-ip')?.trim();
        if (realIp) {
            return realIp;
        }
    } catch {
        // headers() unavailable (e.g. outside a request scope); fall through.
    }
    return 'unknown';
}

export async function generateText(topic: string, wordCount: number) {
    if (typeof topic !== "string" || topic.trim().length === 0) {
        return { success: false, error: "Topic must be a non-empty string." };
    }

    if (topic.length > MAX_TOPIC_LENGTH) {
        return { success: false, error: `Topic must be under ${MAX_TOPIC_LENGTH} characters.` };
    }

    if (typeof wordCount !== "number" || !Number.isFinite(wordCount)) {
        return { success: false, error: "Word count must be a valid number." };
    }

    if (wordCount < MIN_WORD_COUNT || wordCount > MAX_WORD_COUNT) {
        return { success: false, error: `Word count must be between ${MIN_WORD_COUNT} and ${MAX_WORD_COUNT}.` };
    }

    // Throttle per client IP. Degrades gracefully (allows) if Redis is absent.
    const clientKey = await getClientKey();
    const limit = await rateLimit(clientKey, RATE_LIMIT_NAMESPACE, RATE_LIMIT_WINDOWS);

    if (!limit.allowed) {
        // Route through the shared error helper for consistent, sanitized
        // messaging, then add a rate-limit-specific prefix and retry hint.
        const friendly = getUserFriendlyError(new Error("Too many requests"));
        const retryHint = limit.retryAfterSeconds
            ? `Please try again in ${limit.retryAfterSeconds} seconds.`
            : "Please try again later.";
        return {
            success: false,
            error: `Too many requests. ${retryHint} (${friendly.title})`,
        };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return { success: false, error: 'OPENROUTER_API_KEY is not configured.' };
    }

    const openRouter = new OpenRouter({
        apiKey: apiKey,
    });

    try {
        const completion = await openRouter.chat.send({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates meaningful placeholder text based on a topic.',
                },
                {
                    role: 'user',
                    content: `Generate approximately ${wordCount} words of text about "${topic}". The text should be formatted as coherent, standard paragraphs, similar to lorem ipsum but with actual meaning. Avoid titles, lists, or markdown formatting unless natural for the text flow.`,
                },
            ],
        });

        const text = completion.choices?.[0]?.message?.content;

        if (!text) {
            throw new Error('No content received from API');
        }

        return { success: true, text };
    } catch (error) {
        console.error('OpenRouter Error:', error);
        return { success: false, error: 'Failed to generate text. Please try again or check API Key.' };
    }
}
