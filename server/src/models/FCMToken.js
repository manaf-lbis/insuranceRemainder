const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups
fcmTokenSchema.index({ token: 1 });
fcmTokenSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FCMToken', fcmTokenSchema);
