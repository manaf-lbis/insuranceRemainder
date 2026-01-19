/**
 * Masking Utilities for Public Insurance Status Check
 * Privacy-first functions to mask sensitive data
 */

/**
 * Mask vehicle registration number
 * Shows first 2 and last 2 characters, masks rest with asterisks
 * Example: KL01AB1234 becomes KL**AB****
 */
const maskVehicleNumber = (registrationNumber) => {
    if (!registrationNumber || registrationNumber.length < 4) {
        return '****';
    }

    const str = registrationNumber.toString().toUpperCase();
    const first2 = str.substring(0, 2);
    const last2 = str.substring(str.length - 2);
    const middleLength = str.length - 4;
    const masked = '*'.repeat(middleLength);

    return `${first2}${masked}${last2}`;
};

/**
 * Mask mobile number
 * Shows last 2 digits, masks rest with asterisks
 * Example: 9876543210 becomes ********10
 */
const maskMobileNumber = (mobileNumber) => {
    if (!mobileNumber || mobileNumber.length < 2) {
        return '**********';
    }

    const str = mobileNumber.toString();
    const last2 = str.substring(str.length - 2);
    const maskedLength = Math.max(8, str.length - 2);
    const masked = '*'.repeat(maskedLength);

    return `${masked}${last2}`;
};

/**
 * Mask expiry date
 * Shows only year, masks month and day
 * Example: 2026-03-15 becomes asterisks/asterisks/2026
 */
const maskExpiryDate = (date) => {
    if (!date) {
        return '**/**/****';
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        return '**/**/****';
    }

    const year = dateObj.getFullYear();
    return `**/**/${year}`;
};

/**
 * Calculate insurance status based on expiry date
 * Returns: ACTIVE, EXPIRING, or EXPIRED
 */
const calculateInsuranceStatus = (expiryDate) => {
    if (!expiryDate) {
        return 'UNKNOWN';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
        return 'EXPIRED';
    } else if (daysRemaining <= 30) {
        return 'EXPIRING';
    } else {
        return 'ACTIVE';
    }
};

/**
 * Calculate days remaining or days expired
 * Returns positive number for days remaining, negative for days expired
 */
const calculateDaysToExpiry = (expiryDate) => {
    if (!expiryDate) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return daysRemaining;
};

module.exports = {
    maskVehicleNumber,
    maskMobileNumber,
    maskExpiryDate,
    calculateInsuranceStatus,
    calculateDaysToExpiry,
};
