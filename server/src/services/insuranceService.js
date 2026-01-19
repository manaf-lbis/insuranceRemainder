const insuranceRepository = require('../repositories/insuranceRepository');

const calculateExpiryDetails = (expiryDate) => {
    const today = new Date();
    // Reset time to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'ACTIVE';
    if (daysRemaining < 0) {
        status = 'EXPIRED';
    } else if (daysRemaining <= 7) {
        status = 'EXPIRING_SOON';
    } else if (daysRemaining <= 15) {
        status = 'EXPIRING_WARNING';
    } else if (daysRemaining <= 30) {
        status = 'EXPIRING_UPCOMING';
    }

    return { daysRemaining, status };
};

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

const getAllInsurances = async (statusFilter, searchQuery, page = 1, limit = 10) => {
    let filter = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Search Logic
    if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, 'i'); // Case-insensitive
        filter.$or = [
            { customerName: searchRegex },
            { registrationNumber: searchRegex },
            { mobileNumber: searchRegex },
            { vehicleType: searchRegex },
        ];
    }

    // Filter Logic based on status
    if (statusFilter) {
        // Helper to add days to today
        const addDays = (days) => {
            const date = new Date(today);
            date.setDate(date.getDate() + days);
            return date;
        };

        if (statusFilter === 'EXPIRED') {
            filter.policyExpiryDate = { $lt: today };
        } else if (statusFilter === 'EXPIRING_SOON') {
            filter.policyExpiryDate = { $gte: today, $lte: addDays(7) };
        } else if (statusFilter === 'EXPIRING_WARNING') {
            filter.policyExpiryDate = { $gt: addDays(7), $lte: addDays(15) };
        } else if (statusFilter === 'EXPIRING_UPCOMING') {
            filter.policyExpiryDate = { $gt: addDays(15), $lte: addDays(30) };
        } else if (statusFilter === 'ACTIVE') {
            filter.policyExpiryDate = { $gt: addDays(30) };
        }
    }

    // Pagination Calculations
    const skip = (page - 1) * limit;

    // Get Total Count and Data in Parallel
    const [total, insurances] = await Promise.all([
        insuranceRepository.count(filter),
        insuranceRepository.findAll(filter, { policyExpiryDate: 1 }, { skip, limit, populate: true })
    ]);

    // Enrich Data with Expiry Details
    const enrichedInsurances = insurances.map(doc => {
        const insurance = doc.toObject();
        const { daysRemaining, status } = calculateExpiryDetails(insurance.policyExpiryDate);
        return {
            ...insurance,
            daysRemaining,
            expiryStatus: status
        };
    });

    return {
        insurances: enrichedInsurances,
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
    };
};

const getDashboardStatistics = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const addDays = (days) => {
        const date = new Date(today);
        date.setDate(date.getDate() + days);
        return date;
    };

    // Parallel execution for performance
    const [totalActive, totalExpired, expiringSoon, expiringWarning, expiringUpcoming] = await Promise.all([
        insuranceRepository.count({ policyExpiryDate: { $gte: today } }),
        insuranceRepository.count({ policyExpiryDate: { $lt: today } }),
        insuranceRepository.count({ policyExpiryDate: { $gte: today, $lte: addDays(7) } }),
        insuranceRepository.count({ policyExpiryDate: { $gt: addDays(7), $lte: addDays(15) } }),
        insuranceRepository.count({ policyExpiryDate: { $gt: addDays(15), $lte: addDays(30) } }),
    ]);

    return {
        totalActive,
        totalExpired,
        expiringSoon,
        expiringWarning,
        expiringUpcoming,
    };
};

const softDeleteInsurance = async (id, userId, userRole) => {
    const insurance = await insuranceRepository.findById(id);

    if (!insurance) {
        throw new Error('Insurance record not found');
    }

    // Permission check: Admin can delete any, Staff can only delete their own
    if (userRole !== 'admin' && insurance.createdBy.toString() !== userId.toString()) {
        throw new Error('Not authorized to delete this record');
    }

    return await insuranceRepository.softDelete(id, userId);
};

module.exports = {
    addInsurance,
    getAllInsurances,
    getDashboardStatistics,
    softDeleteInsurance,
};
