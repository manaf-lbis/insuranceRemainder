const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema({
    insuranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insurance',
        required: true,
        index: true
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED'],
        required: true
    },
    maskedPhone: {
        type: String,
        required: true
    },
    errorMessage: {
        type: String
    },
    whatsappMessageId: {
        type: String
    },
    metadata: {
        customerName: String,
        policyType: String,
        expiryDate: Date
    }
}, {
    timestamps: true
});

// Index for querying recent reminders for a specific insurance
reminderLogSchema.index({ insuranceId: 1, createdAt: -1 });

// Index for user activity tracking
reminderLogSchema.index({ sentBy: 1, createdAt: -1 });

module.exports = mongoose.model('ReminderLog', reminderLogSchema);
