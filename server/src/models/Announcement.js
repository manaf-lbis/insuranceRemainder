const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Announcement title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Announcement content is required']
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    priority: {
        type: String,
        enum: ['hot', 'warm', 'cold'],
        default: 'cold'
    },
    showInTicker: {
        type: Boolean,
        default: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NewsCategory',
        required: false // Optional for backward compatibility, or set default later
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    views: {
        type: Number,
        default: 0
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for getting latest published announcements quickly
announcementSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
