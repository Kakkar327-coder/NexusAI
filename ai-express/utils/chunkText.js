/**
 * Text Chunking Utilities
 * Provides sliding-window chunking by characters and words with overlap support.
 */

/**
 * Split text by character length with a specified overlap.
 * @param {string} text - The input text string.
 * @param {number} chunkSize - Number of characters per chunk.
 * @param {number} overlap - Overlapping character count between consecutive chunks.
 * @returns {string[]} Array of chunked text slices.
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || typeof text !== 'string') return [];
    const step = Math.max(1, chunkSize - overlap);
    const chunks = [];

    for (let i = 0; i < text.length; i += step) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
};

/**
 * Split text into semantic word chunks with overlap for context continuity.
 * @param {string} text - The input text string.
 * @param {number} chunkSize - Maximum words per chunk.
 * @param {number} overlap - Overlapping word count between consecutive chunks.
 * @returns {string[]} Array of word-based text chunks.
 */
export const chunkTextByWords = (text, chunkSize = 100, overlap = 20) => {
    if (!text || typeof text !== 'string') return [];
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];

    const step = Math.max(1, chunkSize - overlap);
    const chunks = [];

    for (let i = 0; i < words.length; i += step) {
        const chunk = words.slice(i, i + chunkSize);
        chunks.push(chunk.join(' '));
    }

    return chunks;
};