const axios = require('axios');

const WHATSAPP_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '556281704240619';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;

/**
 * Send WhatsApp reminder message using Business Cloud API
 * @param {string} to - Recipient phone number (with country code, e.g., "919876543210")
 * @param {object} templateData - Data for message template
 * @returns {Promise<object>} - API response
 */
const sendReminderTemplate = async (to, templateData) => {
    if (!WHATSAPP_API_KEY) {
        throw new Error('WhatsApp API key not configured');
    }

    const { customerName, policyType, expiryDate } = templateData;

    // Format message (WhatsApp requires specific template format)
    const message = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
            body: `Hello ${customerName},\n\nYour ${policyType} insurance will expire on ${expiryDate}.\nPlease renew it to avoid penalties.\n\n– CSC Insurance Services`
        }
    };

    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            message,
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );

        return {
            success: true,
            messageId: response.data.messages?.[0]?.id,
            data: response.data
        };
    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);

        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Send reminder with retry logic (exponential backoff)
 * @param {string} to - Recipient phone number
 * @param {object} templateData - Message data
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<object>} - Result
 */
const sendReminderWithRetry = async (to, templateData, maxRetries = 3) => {
    let lastError;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const result = await sendReminderTemplate(to, templateData);

        if (result.success) {
            return result;
        }

        lastError = result.error;

        // Exponential backoff: wait 1s, 2s, 4s...
        if (attempt < maxRetries - 1) {
            const waitTime = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    return {
        success: false,
        error: lastError || 'Failed after retries'
    };
};

module.exports = {
    sendReminderTemplate,
    sendReminderWithRetry
};
