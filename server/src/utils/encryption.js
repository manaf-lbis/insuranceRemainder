const crypto = require('crypto');

// AES-256 requires a 32-byte key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-byte-encryption-key!'; // Must be 32 bytes
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt sensitive text (like phone numbers)
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
const encrypt = (text) => {
    if (!text) return text;

    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)), iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV and encrypted data separated by ':'
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt encrypted text
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
const decrypt = (encryptedText) => {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;

    try {
        // Split IV and encrypted data
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32)), iv);

        // Decrypt
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error.message);
        return encryptedText; // Return as-is if decryption fails (backwards compatibility)
    }
};

/**
 * Mask phone number for logging (show last 4 digits only)
 * @param {string} phoneNumber - Phone number to mask
 * @returns {string} - Masked phone number
 */
const maskPhoneNumber = (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 4) return '******';
    return '******' + phoneNumber.slice(-4);
};

module.exports = {
    encrypt,
    decrypt,
    maskPhoneNumber
};
