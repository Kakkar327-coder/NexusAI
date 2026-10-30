import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
    console.warn('[AI Config] Warning: GEMINI_API_KEY is not set in environment. Set it in .env to use Gemini features.');
}

export const ai = new GoogleGenAI({
    apiKey
});