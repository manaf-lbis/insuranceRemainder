const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) ||
        req.query.token
    ) {
        try {
            // Get token from header or query
            token = req.headers.authorization
                ? req.headers.authorization.split(' ')[1]
                : req.query.token;

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user || !req.user.isActive || req.user.isApproved === false) {
                res.status(401);
                const reason = !req.user ? 'User not found' : !req.user.isActive ? 'Account blocked' : 'Account pending approval';
                throw new Error(`Not authorized, ${reason}`);
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // No token provided
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};


const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const staffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as staff or admin' });
    }
};

module.exports = { protect, admin, staffOrAdmin };
