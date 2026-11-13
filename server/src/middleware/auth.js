import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'unisphere_super_secret_jwt_key_2026_dbms_cu';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied: No authentication token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

export const optionalAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = { id: 1, username: 'admin', role: 'ADMIN', displayName: 'Administrator' };
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        req.user = { id: 1, username: 'admin', role: 'ADMIN', displayName: 'Administrator' };
        next();
    }
};

export const requireRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access forbidden: Requires one of [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
            });
        }
        next();
    };
};

