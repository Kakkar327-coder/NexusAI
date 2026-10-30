import express from 'express';
import {
    agentController,
    AgentkeThrough,
    analyzeImageController,
    analyzePDFController,
    Answer,
    answer,
    chat,
    chatEmbedding,
    chatStream,
    createChunkEmbedding,
    createEmbedding,
    echat,
    filterSearch,
    functionCallControllers,
    GenerateChunkEmbedding,
    HybridSearch,
    KeywordSearch,
    pdfRagController,
    pdfStore,
    planningController,
    ragChat,
    weatherController,
    uploadDocs,
    RAns,
    optimizePromptController
} from '../controllers/ai.controllers.js';
import upload from '../middlewares/upload.middleware.js';

const router = express.Router();

// 💬 Core Chat & Streaming Endpoints
router.post('/chat', chat);
router.post('/chunk', chatStream);
router.post('/fast-chat', answer);
router.post('/optimize-prompt', optimizePromptController);
router.post('/payal', answer); // Legacy alias

// 🧠 Embeddings & Vector Processing
router.post('/embedding', chatEmbedding);
router.post('/embeddings', createEmbedding);
router.post('/embeddings/chunks', createChunkEmbedding);
router.post('/generate', GenerateChunkEmbedding);

// 🔍 Search & RAG Endpoints
router.post('/ret', KeywordSearch);
router.post('/filterRag', filterSearch);
router.post('/answer', ragChat);
router.post('/expandQuery', echat);
router.post('/rrf', HybridSearch);
router.post('/combinedAns', Answer);

// 🤖 Autonomous Agents & Function Calling
router.post('/agent', agentController);
router.post('/functioncall', functionCallControllers);
router.post('/weathercontrol', weatherController);
router.post('/planningexecution', planningController);

// 👁️ Multimodal Vision & Document Intelligence
router.post('/image', analyzeImageController);
router.post('/pdf', analyzePDFController);
router.post('/pdfRagAns', pdfRagController);
router.post('/storepdfthings', pdfStore);

// 📄 Document Upload & RAG Ingestion
router.post('/upload-docs', upload.single('file'), uploadDocs);
router.post('/upload-pdf', upload.single('file'), uploadDocs);
router.post('/rag-ans', RAns);
router.post('/rans', RAns);

export default router;