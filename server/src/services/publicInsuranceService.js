/**
 * Public Insurance Service
 * Read-only service for public insurance status checks
 * PRIVACY-FIRST: All data is masked before returning
 */

const insuranceRepository = require('../repositories/insuranceRepository');
const {
    maskVehicleNumber,
    calculateInsuranceStatus,
    calculateDaysToExpiry,
} = require('../utils/maskingUtils');

/**
 * Check insurance status by vehicle registration number
 * Returns masked data only
 */
const checkInsuranceByVehicle = async (registrationNumber) => {
    if (!registrationNumber || typeof registrationNumber !== 'string') {
        throw new Error('Invalid vehicle registration number');
    }

    // Normalize input (uppercase, trim, remove internal spaces and dashes)
    const normalizedRegNumber = registrationNumber.toUpperCase().trim().replace(/[\s-]/g, '');

    // Search for insurance record - get the LATEST one by sorting by expiry date desc
    const insurance = await insuranceRepository.findOne(
        { registrationNumber: normalizedRegNumber },
        { policyExpiryDate: -1 },
        { populate: false } // No population needed for public search
    );

    // Generic error if not found (don't reveal if record exists)
    if (!insurance) {
        return null;
    }

    const daysToExpiry = calculateDaysToExpiry(insurance.policyExpiryDate);

    // Return ONLY masked data
    return [{
        maskedVehicleNumber: maskVehicleNumber(insurance.registrationNumber),
        insuranceStatus: calculateInsuranceStatus(insurance.policyExpiryDate),
        daysToExpiry: daysToExpiry,
    }];
};

/**
 * Check insurance status by mobile number
 * Returns masked data for ALL vehicles linked to this mobile number
 */
const checkInsuranceByMobile = async (mobileNumber) => {
    if (!mobileNumber || typeof mobileNumber !== 'string') {
        throw new Error('Invalid mobile number');
    }

    // Normalize input (trim)
    const normalizedMobile = mobileNumber.trim();

    // Validate format (10 digits)
    if (!/^[0-9]{10}$/.test(normalizedMobile)) {
        throw new Error('Invalid mobile number format');
    }

    // Search for ALL insurance records with this mobile number in EITHER field, sorted by latest expiry first
    const insurances = await insuranceRepository.findAll(
        {
            $or: [
                { mobileNumber: normalizedMobile },
                { alternateMobileNumber: normalizedMobile }
            ]
        },
        { policyExpiryDate: -1 },
        { populate: false } // No population needed for public search
    );

    // Generic error if not found (don't reveal if record exists)
    if (!insurances || insurances.length === 0) {
        return null;
    }

    // Return ONLY masked data for all vehicles
    return insurances.map(insurance => {
        const daysToExpiry = calculateDaysToExpiry(insurance.policyExpiryDate);

        return {
            maskedVehicleNumber: maskVehicleNumber(insurance.registrationNumber),
            insuranceStatus: calculateInsuranceStatus(insurance.policyExpiryDate),
            daysToExpiry: daysToExpiry,
        };
    });
};

module.exports = {
    checkInsuranceByVehicle,
    checkInsuranceByMobile,
};
