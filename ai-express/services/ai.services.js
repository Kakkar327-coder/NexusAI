import { ai } from '../config/ai.js';
import { z } from 'zod';
import { chunkTextByWords } from '../utils/chunkText.js';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import Embedding from '../models/embedding.models.js';
import path from 'path';

const taskSchema = z.object({
    title: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    due: z.string().optional()
});

export const generateAi = async (message) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: message,
        config: {
            systemInstruction: 'Answer questions concisely, accurately, and clearly.'
        }
    });
    return response;
};

export const generateAIResponse = async (message) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: message,
        config: {
            systemInstruction: `You are a helpful task assistant.
Convert the user request into a structured task object.
Return ONLY valid JSON in this exact format:
{
    "title": "string",
    "priority": "low" | "medium" | "high",
    "due": "string"
}
Extract the key action for the title. Do not repeat raw prompt text.`,
            responseMimeType: 'application/json'
        }
    });

    const rawData = JSON.parse(response.text);
    return taskSchema.parse(rawData);
};

export const generateAIStream = async (message) => {
    return await ai.models.generateContentStream({
        model: 'gemini-3.6-flash-lite',
        contents: message,
        config: {
            systemInstruction: 'You are an intelligent AI assistant. Provide helpful, structured, and informative responses.'
        }
    });
};

export const generateEmbedding = async (text) => {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text
    });
    return response.embeddings[0].values;
};

export const generateTextResponse = async (prompt) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: prompt
    });
    return response.text;
};

export const rewriteQuery = async (query) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: `Rewrite the user query into a clean, specific search query for document retrieval. Return only the rewritten query without conversational filler. User query: ${query}`
    });
    return response.text.trim();
};

export const expandQuery = async (query) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: `Generate 3 distinct search variations to maximize document retrieval recall for the user question. Return only 3 lines, one query per line. Do not answer the question. User query: ${query}`
    });
    return response.text.trim()
        .split('\n')
        .map(q => q.replace(/^\d+[\).\s-]*/, '').trim())
        .filter(Boolean);
};

export const addNumbers = (a, b) => {
    return Number(a) + Number(b);
};

export const getWeather = async (city) => {
    const apiKey = process.env.WEATHER_API_KEY;
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Weather data retrieval failed for ${city}`);
    }

    return {
        city: data.name,
        temperature: data.main?.temp,
        condition: data.weather?.[0]?.description
    };
};

export const tools = {
    addNumbers,
    getWeather
};

export const functionCalling = async (message) => {
    return await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: message,
        config: {
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: 'addNumbers',
                            description: 'Add two numbers together',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    a: { type: 'NUMBER', description: 'First number' },
                                    b: { type: 'NUMBER', description: 'Second number' }
                                },
                                required: ['a', 'b']
                            }
                        }
                    ]
                }
            ]
        }
    });
};

export const weatherTool = async (message) => {
    return await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: message,
        config: {
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: 'getWeather',
                            description: 'Get current weather information for a specified city',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    city: { type: 'STRING', description: 'Name of the city' }
                                },
                                required: ['city']
                            }
                        }
                    ]
                }
            ]
        }
    });
};

export const agent = async (query) => {
    return await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: query,
        config: {
            tools: [
                {
                    functionDeclarations: [
                        {
                            name: 'addNumbers',
                            description: 'Add two numbers',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    a: { type: 'NUMBER' },
                                    b: { type: 'NUMBER' }
                                },
                                required: ['a', 'b']
                            }
                        },
                        {
                            name: 'getWeather',
                            description: 'Get current weather information for a city',
                            parameters: {
                                type: 'OBJECT',
                                properties: {
                                    city: { type: 'STRING' }
                                },
                                required: ['city']
                            }
                        }
                    ]
                }
            ]
        }
    });
};

export const createPlan = async (query) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: `You are an AI planning agent. Break down the user request into sequential executable tool steps.
Available tools:
1. getWeather(city)
2. addNumbers(a, b)

Return ONLY valid JSON array in this format:
[
    {
        "tool": "getWeather",
        "args": { "city": "San Francisco" }
    },
    {
        "tool": "addNumbers",
        "args": { "a": 25, "b": 35 }
    }
]

Rules:
- Each item must contain "tool" and "args".
- Do not execute tools.
- Return raw JSON only.

User request:
${query}`,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const cleanText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
};

export const executePlan = async (plan) => {
    const results = [];
    for (const step of plan) {
        const tool = tools[step.tool];
        if (!tool) {
            throw new Error(`Tool not found: ${step.tool}`);
        }
        const result = await tool(...Object.values(step.args));
        results.push({
            tool: step.tool,
            args: step.args,
            result
        });
    }
    return results;
};

export const agentLoop = async (query) => {
    const message = [
        {
            role: 'user',
            parts: [{ text: query }]
        }
    ];

    while (true) {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash-lite',
            contents: message,
            config: {
                tools: [
                    {
                        functionDeclarations: [
                            {
                                name: 'addNumbers',
                                description: 'Add two numbers together',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        a: { type: 'NUMBER', description: 'first number' },
                                        b: { type: 'NUMBER', description: 'second number' }
                                    },
                                    required: ['a', 'b']
                                }
                            },
                            {
                                name: 'getWeather',
                                description: 'Get current weather information for a city',
                                parameters: {
                                    type: 'OBJECT',
                                    properties: {
                                        city: { type: 'STRING', description: 'city name' }
                                    },
                                    required: ['city']
                                }
                            }
                        ]
                    }
                ]
            }
        });

        const functionCalling = response.functionCalls?.[0];

        // When no tool calls remain, return the model's final synthesis
        if (!functionCalling) {
            return response.text;
        }

        const tool = tools[functionCalling.name];
        if (!tool) {
            throw new Error(`Tool not found: ${functionCalling.name}`);
        }

        const result = await tool(...Object.values(functionCalling.args));

        message.push(response.candidates[0].content);
        message.push({
            role: 'user',
            parts: [
                {
                    functionResponse: {
                        name: functionCalling.name,
                        response: { result }
                    }
                }
            ]
        });
    }
};

export const analyzeImage = async (imageBase64, question) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: [
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            },
            {
                text: question
            }
        ]
    });
    return response.text;
};

export const analyzeImageStructure = async (imageBase64, question) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: [
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            },
            {
                text: `Analyze the image and answer the question: ${question}`
            }
        ],
        config: {
            responseMimeType: 'application/json'
        }
    });
    return JSON.parse(response.text);
};

export const analyzePDF = async (pdfBase64, question) => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: [
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: pdfBase64
                }
            },
            {
                text: question
            }
        ]
    });
    return response.text;
};

export const processPdf = async (input, originalName = 'document.pdf') => {
    let dataBuffer;
    let sourceName = originalName;

    if (Buffer.isBuffer(input)) {
        dataBuffer = input;
    } else if (typeof input === 'string') {
        dataBuffer = fs.readFileSync(input);
        sourceName = originalName || path.basename(input);
    } else {
        throw new Error('Invalid input: expected Buffer or file path string');
    }

    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    if (typeof parser.destroy === 'function') {
        await parser.destroy();
    }

    const text = data.text;
    const chunks = chunkTextByWords(text, 250, 50);

    const results = [];
    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        const doc = await Embedding.create({
            text: chunk,
            embedding: embedding,
            source: sourceName
        });
        results.push(doc);
    }
    return results;
};

export const extractPdfText = async (filePath) => {
    return await processPdf(filePath, filePath);
};

export const ProcessPdf = processPdf;

export const pdfRag = async (query, source = null) => {
    const queryEmbedding = await generateEmbedding(query);
    const cleanName = source ? source.replace(/^.*[\\\/]/, '').trim() : null;

    const vectorSearchStage = {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 50,
        limit: 5
    };

    if (cleanName) {
        vectorSearchStage.filter = {
            source: {
                $in: [cleanName, `uploads/${cleanName}`, `./uploads/${cleanName}`, source]
            }
        };
    }

    let results = [];
    try {
        results = await Embedding.aggregate([
            { $vectorSearch: vectorSearchStage },
            {
                $project: {
                    text: 1,
                    source: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);
    } catch (err) {
        // Fallback for standard MongoDB instances without Atlas Vector Search enabled
        const fallbackResults = await Embedding.aggregate([
            {
                $vectorSearch: {
                    index: 'vector_index',
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: 30
                }
            },
            {
                $project: {
                    text: 1,
                    source: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]).catch(() => []);

        if (cleanName && fallbackResults.length > 0) {
            const filtered = fallbackResults.filter(doc => {
                if (!doc.source) return false;
                const docBase = doc.source.replace(/^.*[\\\/]/, '').trim().toLowerCase();
                return docBase === cleanName.toLowerCase() || doc.source.toLowerCase().includes(cleanName.toLowerCase());
            });
            results = filtered.length > 0 ? filtered.slice(0, 5) : fallbackResults.slice(0, 5);
        } else {
            results = fallbackResults.slice(0, 5);
        }
    }

    // Direct chunk retrieval fallback
    if ((!results || results.length === 0) && cleanName) {
        const escapeRegex = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const directChunks = await Embedding.find({
            source: { $regex: escapeRegex, $options: 'i' }
        }).limit(8).select('text source');

        if (directChunks && directChunks.length > 0) {
            results = directChunks;
        }
    }

    // Final fallback to most recently indexed chunks
    if (!results || results.length === 0) {
        const recentChunks = await Embedding.find().sort({ _id: -1 }).limit(6).select('text source');
        if (recentChunks && recentChunks.length > 0) {
            results = recentChunks;
        }
    }

    const context = results.map(r => r.text).filter(Boolean).join('\n\n');
    const prompt = `You are an expert AI document analysis assistant.
The user is asking questions about the document: "${cleanName || 'uploaded document'}".

Retrieved Document Content:
--- BEGIN DOCUMENT CONTENT ---
${context}
--- END DOCUMENT CONTENT ---

User Question: ${query}

Instructions:
1. Answer the user question clearly, thoroughly, and factually based on the content above.
2. If summarizing, synthesize key sections, figures, dates, and conclusions.
3. If partial context exists, explain what is available from the document.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
    });

    return response.text;
};

export const RagAnss = pdfRag;
export const GenerateEmbedding = generateEmbedding;
export const GeneratePromptResponse = generateTextResponse;

export const optimizePrompt = async (prompt, framework = 'CO-STAR') => {
    const systemInstruction = `You are an elite Prompt Engineer and AI System Architect.
Your task is to take a raw, informal, or incomplete user prompt and engineer it into a high-precision, production-grade prompt.

Framework to apply: ${framework}
(CO-STAR = Context, Objective, Style, Tone, Audience, Response format).

Return strictly a valid JSON object matching this schema:
{
    "optimizedPrompt": "The fully engineered prompt ready for LLM consumption, including clear persona, context, step-by-step instructions, output format, and edge-case constraints",
    "framework": "${framework}",
    "technique": "A short summary of the engineering strategy applied (e.g. Context Grounding with Structured Constraints)",
    "improvements": [
        "Concise bullet explaining improvement 1",
        "Concise bullet explaining improvement 2",
        "Concise bullet explaining improvement 3"
    ],
    "suggestedVariables": ["{TOPIC}", "{OUTPUT_FORMAT}"]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash-lite',
        contents: `Raw prompt to optimize: "${prompt}"`,
        config: {
            systemInstruction,
            responseMimeType: 'application/json'
        }
    });

    const cleanText = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
};

