import jwt from 'jsonwebtoken';

export const AuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Missing Bearer token.'
            });
        }

        const token = authHeader.split(' ')[1];
        const secretKey = process.env.AccKey || process.env.JWT_SECRET || 'express_ai_fallback_secret_key_2026';

        const decoded = jwt.verify(token, secretKey);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token signature'
            });
        }

        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: err.message || 'Invalid authentication token'
        });
    }
};
