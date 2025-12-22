'use server';

import { OpenRouter } from '@openrouter/sdk';

export async function generateText(topic: string, wordCount: number) {
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
