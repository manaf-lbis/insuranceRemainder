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
