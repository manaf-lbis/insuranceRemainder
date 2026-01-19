/**
 * Rate Limiting Middleware for Public API
 * Prevents abuse by limiting requests per IP address
 */

// Simple in-memory store for rate limiting
// In production, use Redis or similar for distributed systems
const requestStore = new Map();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

/**
 * Clean up old entries from the request store
 */
const cleanupStore = () => {
    const now = Date.now();
    for (const [ip, data] of requestStore.entries()) {
        if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
            requestStore.delete(ip);
        }
    }
};

// Run cleanup every minute
setInterval(cleanupStore, RATE_LIMIT_WINDOW_MS);

/**
 * Rate limiting middleware
 */
const rateLimiter = (req, res, next) => {
    // Get client IP address
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    const now = Date.now();

    // Get or create request data for this IP
    let requestData = requestStore.get(clientIp);

    if (!requestData) {
        // First request from this IP
        requestData = {
            count: 1,
            windowStart: now,
        };
        requestStore.set(clientIp, requestData);
        return next();
    }

    // Check if we're still in the same time window
    const timeSinceWindowStart = now - requestData.windowStart;

    if (timeSinceWindowStart > RATE_LIMIT_WINDOW_MS) {
        // New time window, reset counter
        requestData.count = 1;
        requestData.windowStart = now;
        requestStore.set(clientIp, requestData);
        return next();
    }

    // Still in the same window, increment counter
    requestData.count++;

    if (requestData.count > MAX_REQUESTS_PER_WINDOW) {
        // Rate limit exceeded
        return res.status(429).json({
            message: 'Too many requests, please try again later',
        });
    }

    requestStore.set(clientIp, requestData);
    next();
};

module.exports = rateLimiter;
