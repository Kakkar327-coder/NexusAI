import 'dotenv/config';
import express from 'express';
import aiRouter from './routes/ai.routes.js';
import authRouter from './routes/User.routes.js';
import { connection } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Request body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoints
const handleHealth = (req, res) => {
    res.json({
        status: 'ok',
        service: 'NexusAI API',
        uptime: `${Math.round(process.uptime())}s`,
        timestamp: new Date().toISOString()
    });
};
app.get('/health', handleHealth);
app.get('/api/v1/health', handleHealth);

// Application routes
app.use('/api/v1', aiRouter);
app.use('/api/auth', authRouter);

// Start server after connecting to database
await connection();

app.listen(PORT, () => {
    console.log(`Server actively running on port ${PORT}`);
});
