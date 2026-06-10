import jwt from 'jsonwebtoken';

// Middleware for role-based authentication
export const authenticateRole = (requiredRole) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            console.error('Authorization header missing');
            return res.status(403).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1]; // Extract token if prefixed with "Bearer"
        if (!token) {
            console.error('Token format invalid');
            return res.status(403).json({ message: 'Access denied. Invalid token format.' });
        }

        try {
            const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Use environment variable for secret
            console.log('Using Secret Key:', secretKey); // Log the secret key for debugging
            console.log('Received Token:', token); // Log the token for debugging

            const decoded = jwt.verify(token, secretKey); // Verify token
            req.user = decoded;

            if (decoded.role !== requiredRole) {
                console.error('Insufficient permissions for role:', decoded.role);
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message); // Log error for debugging
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired.' });
            }
            return res.status(401).json({ message: 'Invalid token.' });
        }
    };
};