const mongoose = require('mongoose');

const posterSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        default: 'Untitled Poster'
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required']
    },
    publicId: {
        type: String,
        required: [true, 'Cloudinary Public ID is required']
    },
    dominantColor: {
        type: String,
        default: '#1e3a8a'
    },
    headline: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    showButton: {
        type: Boolean,
        default: true
    },
    buttonText: {
        type: String,
        default: 'Quick Apply'
    },
    whatsappNumber: {
        type: String,
        default: '9633565414'
    },
    messageTemplate: {
        type: String,
        default: 'Hello, I would like to apply for insurance.'
    },
    isActive: {
        type: Boolean,
        default: false,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure only one poster is active at a time (application logic should enforce this, but index helps)
posterSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model('Poster', posterSchema);
