const insuranceRepository = require('../repositories/insuranceRepository');

const addInsurance = async (data, userId) => {
    // Business Logic: Validate dates
    if (new Date(data.policyStartDate) >= new Date(data.policyExpiryDate)) {
        throw new Error('Policy start date must be before expiry date');
    }

    // Attach createdBy and createdAt (handled by timestamps in model, but userId needed)
    const insuranceData = {
        ...data,
        createdBy: userId,
    };

    return await insuranceRepository.create(insuranceData);
};

const getAllInsurances = async () => {
    // Sort by expiry date ascending
    return await insuranceRepository.findAll({}, { policyExpiryDate: 1 });
};

module.exports = {
    addInsurance,
    getAllInsurances,
};
