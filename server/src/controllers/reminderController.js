const Insurance = require('../models/Insurance');
const ReminderLog = require('../models/ReminderLog');
const whatsappService = require('../services/whatsappService');
const { decrypt, maskPhoneNumber } = require('../utils/encryption');

/**
 * Send WhatsApp reminder for an insurance policy
 * @route POST /api/insurances/:id/remind
 * @access Private (Staff/Admin)
 */
const sendReminder = async (req, res) => {
    try {
        const insuranceId = req.params.id;
        const userId = req.user._id;

        // 1. Find insurance record
        const insurance = await Insurance.findById(insuranceId);

        if (!insurance || insurance.isDeleted) {
            return res.status(404).json({ message: 'Insurance record not found' });
        }

        // 2. Check for duplicate reminders (cooldown: 24 hours)
        const cooldownHours = 24;
        const recentReminder = await ReminderLog.findOne({
            insuranceId: insuranceId,
            createdAt: { $gte: new Date(Date.now() - cooldownHours * 60 * 60 * 1000) }
        }).sort({ createdAt: -1 });

        if (recentReminder) {
            const hoursElapsed = Math.floor((Date.now() - recentReminder.createdAt) / (1000 * 60 * 60));
            return res.status(429).json({
                message: `Please wait ${cooldownHours - hoursElapsed} more hour(s) before sending another reminder for this policy`
            });
        }

        // 3. Decrypt phone number (if encrypted, otherwise use as-is)
        const phoneNumber = decrypt(insurance.mobileNumber);

        // Validate phone number format
        if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number in insurance record' });
        }

        // 4. Format phone number for WhatsApp (add country code)
        const formattedPhone = '91' + phoneNumber; // India country code

        // 5. Prepare message data
        const templateData = {
            customerName: insurance.customerName,
            policyType: insurance.insuranceType,
            expiryDate: insurance.policyExpiryDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        };

        // 6. Send WhatsApp message with retry
        const result = await whatsappService.sendReminderWithRetry(formattedPhone, templateData);

        // 7. Log reminder attempt
        const reminderLog = await ReminderLog.create({
            insuranceId: insurance._id,
            sentBy: userId,
            status: result.success ? 'SUCCESS' : 'FAILED',
            maskedPhone: maskPhoneNumber(phoneNumber),
            errorMessage: result.error,
            whatsappMessageId: result.messageId,
            metadata: {
                customerName: insurance.customerName,
                policyType: insurance.insuranceType,
                expiryDate: insurance.policyExpiryDate
            }
        });

        // 8. Return response (no sensitive data)
        if (result.success) {
            res.status(200).json({
                message: 'Reminder sent successfully',
                logId: reminderLog._id
            });
        } else {
            res.status(500).json({
                message: 'Failed to send reminder. Please try again later.',
                logId: reminderLog._id
            });
        }

    } catch (error) {
        console.error('Send Reminder Error:', error);
        res.status(500).json({ message: 'Server error while sending reminder' });
    }
};

/**
 * Get reminder logs for an insurance policy (Admin only)
 * @route GET /api/insurances/:id/reminder-logs
 * @access Private (Admin)
 */
const getReminderLogs = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const insuranceId = req.params.id;

        const logs = await ReminderLog.find({ insuranceId })
            .populate('sentBy', 'username')
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(logs);
    } catch (error) {
        console.error('Get Reminder Logs Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    sendReminder,
    getReminderLogs
};
