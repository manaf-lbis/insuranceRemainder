const FCMToken = require('../models/FCMToken');

/**
 * @desc    Subscribe to push notifications
 * @route   POST /api/notifications/subscribe
 * @access  Public
 */
const subscribe = async (req, res) => {
    try {
        const { token } = req.body;
        const userAgent = req.headers['user-agent'];

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Check if token already exists
        const existing = await FCMToken.findOne({ token });

        if (existing) {
            // Update last used
            existing.lastUsed = new Date();
            await existing.save();
            return res.status(200).json({ message: 'Already subscribed', token: existing });
        }

        // Create new subscription
        const fcmToken = await FCMToken.create({
            token,
            userAgent
        });

        res.status(201).json({ message: 'Subscribed successfully', token: fcmToken });
    } catch (error) {
        console.error('Error subscribing:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Unsubscribe from push notifications
 * @route   POST /api/notifications/unsubscribe
 * @access  Public
 */
const unsubscribe = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        await FCMToken.deleteOne({ token });
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    subscribe,
    unsubscribe
};
