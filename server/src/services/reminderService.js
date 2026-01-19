const Reminder = require('../models/Reminder');
const Insurance = require('../models/Insurance');
const notificationProvider = require('./notificationProvider');

const sendReminder = async (insuranceId, user) => {
    const insurance = await Insurance.findById(insuranceId);
    if (!insurance) {
        throw new Error('Insurance record not found');
    }

    // Eligibility Check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiryDate = new Date(insurance.policyExpiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        throw new Error('Policy already expired. Cannot send reminder.');
    }

    if (diffDays > 30) {
        throw new Error('Policy is not within the 30-day reminder window.');
    }

    if (!insurance.mobileNumber) {
        throw new Error('Customer mobile number is missing.');
    }

    // Prepare Message
    const message = `Dear ${insurance.customerName}, your ${insurance.vehicleType} insurance (${insurance.registrationNumber}) expires in ${diffDays} days on ${expiryDate.toLocaleDateString()}. Please renew at CSC Center.`;

    // Send Notification
    await notificationProvider.sendSMS(insurance.mobileNumber, message);

    // Log Reminder
    const reminder = await Reminder.create({
        insuranceId: insurance._id,
        customerName: insurance.customerName,
        vehicleRegNo: insurance.registrationNumber,
        staffId: user._id,
        staffName: user.username,
        channel: 'SMS',
        message,
        status: 'SENT',
    });

    return reminder;
};

module.exports = {
    sendReminder,
};
