const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    insuranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insurance',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    vehicleRegNo: {
        type: String,
        required: true,
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    staffName: {
        type: String,
        required: true,
    },
    channel: {
        type: String,
        enum: ['SMS', 'WhatsApp'],
        default: 'SMS',
    },
    status: {
        type: String,
        default: 'SENT',
    },
    message: String,
}, {
    timestamps: { createdAt: 'sentAt', updatedAt: false },
});

module.exports = mongoose.model('Reminder', reminderSchema);
