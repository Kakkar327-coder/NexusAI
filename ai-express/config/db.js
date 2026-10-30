import mongoose from 'mongoose';

export const connection = async () => {
    try {
        const mongoUri = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ai_evaluation';
        await mongoose.connect(mongoUri);
        console.log('Connected successfully to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};