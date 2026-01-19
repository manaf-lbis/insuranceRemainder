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

const getAllInsurances = async (statusFilter, searchQuery, page = 1, limit = 10, user, expiryFrom, expiryTo) => {
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

    // Date Range Filter
    if (expiryFrom && expiryTo) {
        const fromDate = new Date(expiryFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day

        const toDate = new Date(expiryTo);
        toDate.setHours(23, 59, 59, 999); // End of day

        // If status filter also exists, we need to be careful not to overwrite policyExpiryDate criteria
        // Status filters (ACTIVE, EXPIRED etc) also use policyExpiryDate
        // So we combine them using $and if needed

        const dateRangeQuery = { $gte: fromDate, $lte: toDate };

        if (filter.policyExpiryDate) {
            // Combine existing status status date query with new range query
            // e.g. status=EXPIRED (< today) AND range=Jan 1 to Jan 31
            // MongoDB works better with explicit $and for same field collisions usually, 
            // but for simple ranges we can try to merge or use $and.
            // Using $and is safer to avoid overwriting keys.
            if (!filter.$and) filter.$and = [];
            filter.$and.push({ policyExpiryDate: dateRangeQuery });
            filter.$and.push({ policyExpiryDate: filter.policyExpiryDate });
            delete filter.policyExpiryDate; // Move original to $and
        } else {
            filter.policyExpiryDate = dateRangeQuery;
        }
    }

    // Status Logic (Existing)
    if (statusFilter) {
        // Helper to add days to today
        const addDays = (days) => {
            const date = new Date(today);
            date.setDate(date.getDate() + days);
            return date;
        };

        let statusQuery = {};
        if (statusFilter === 'EXPIRED') {
            statusQuery = { $lt: today };
        } else if (statusFilter === 'EXPIRING_SOON') {
            statusQuery = { $gte: today, $lte: addDays(7) };
        } else if (statusFilter === 'EXPIRING_WARNING') {
            statusQuery = { $gt: addDays(7), $lte: addDays(15) };
        } else if (statusFilter === 'EXPIRING_UPCOMING') {
            statusQuery = { $gt: addDays(15), $lte: addDays(30) };
        } else if (statusFilter === 'ACTIVE') {
            statusQuery = { $gt: addDays(30) };
        }

        // Apply status query
        if (filter.policyExpiryDate) {
            // If we already have a date range query (from above block), combine them
            if (!filter.$and) {
                filter.$and = [];
                filter.$and.push({ policyExpiryDate: filter.policyExpiryDate });
                delete filter.policyExpiryDate;
            }
            filter.$and.push({ policyExpiryDate: statusQuery });
        } else {
            // No existing date query in root
            if (filter.$and) {
                // $and exists (maybe from search?), just push
                filter.$and.push({ policyExpiryDate: statusQuery });
            } else {
                filter.policyExpiryDate = statusQuery;
            }
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

const updateInsurance = async (id, data, userId, userRole) => {
    // Only admin can update insurance records
    if (userRole !== 'admin') {
        throw new Error('Only administrators can update insurance records');
    }

    const insurance = await insuranceRepository.findById(id);
    if (!insurance) {
        throw new Error('Insurance record not found');
    }

    // Validate dates if they are being updated
    if (data.policyStartDate && data.policyExpiryDate) {
        if (new Date(data.policyStartDate) >= new Date(data.policyExpiryDate)) {
            throw new Error('Policy start date must be before expiry date');
        }
    }

    return await insuranceRepository.update(id, data);
};

const getInsuranceById = async (id) => {
    return await insuranceRepository.findById(id);
};

module.exports = {
    addInsurance,
    getAllInsurances,
    getDashboardStatistics,
    softDeleteInsurance,
    updateInsurance,
    getInsuranceById,
};
