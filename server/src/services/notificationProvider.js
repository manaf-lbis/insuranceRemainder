// Mock Notification Provider

const sendSMS = async (mobileNumber, message) => {
    // In a real system, this would integrate with Twilio, AWS SNS, etc.
    console.log(`[NotificationProvider] sending SMS to ${mobileNumber}: "${message}"`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, messageId: 'mock-msg-id-' + Date.now() };
};

module.exports = {
    sendSMS,
};
