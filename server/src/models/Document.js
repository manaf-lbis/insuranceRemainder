const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    filePublicId: {
        type: String,
        required: true,
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    fileType: {
        type: String,
        default: 'application/pdf',
    },
    fileResourceType: {
        type: String,
        default: 'image',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    downloadCount: {
        type: Number,
        default: 0,
    },
    rejectionReason: {
        type: String,
        trim: true,
    },
    termsAccepted: {
        type: Boolean,
        default: false,
        required: true
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Document', documentSchema);
