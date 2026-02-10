'use server';

import { OpenRouter } from '@openrouter/sdk';

const MAX_TOPIC_LENGTH = 500;
const MIN_WORD_COUNT = 10;
const MAX_WORD_COUNT = 5000;

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
