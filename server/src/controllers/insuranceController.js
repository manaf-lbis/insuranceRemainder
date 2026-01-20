const insuranceService = require('../services/insuranceService');

// @desc    Add new insurance
// @route   POST /api/insurances
// @access  Private (Staff/Admin)
const createInsurance = async (req, res) => {
    try {
        const insurance = await insuranceService.addInsurance(req.body, req.user._id);
        res.status(201).json(insurance);
    } catch (error) {
        // Simple error handling for bad requests vs server errors
        // In a real app, use a custom error handler
        if (error.message.includes('required') || error.message.includes('valid') || error.message.includes('must be')) {
            res.status(400).json({ message: error.message });
        } else {
            console.error('Create Insurance Error:', error); // DEBUG LOG
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Get all insurances
// @route   GET /api/insurances
// @access  Private
const getInsurances = async (req, res) => {
    try {
        const { status, search, from, to, expiryFrom, expiryTo } = req.query; // Support new params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Normalize date params - check if frontend sent 'from/to' or 'expiryFrom/expiryTo'
        const fromDate = expiryFrom || from;
        const toDate = expiryTo || to;

        const result = await insuranceService.getAllInsurances(status, search, page, limit, req.user, fromDate, toDate);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Soft delete insurance
// @route   DELETE /api/insurances/:id
// @access  Private (Owner or Admin)
const deleteInsurance = async (req, res) => {
    try {
        await insuranceService.softDeleteInsurance(req.params.id, req.user._id, req.user.role);
        res.status(200).json({ message: 'Insurance record removed' });
    } catch (error) {
        if (error.message === 'Insurance record not found') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Not authorized to delete this record') {
            res.status(403).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Update insurance
// @route   PUT /api/insurances/:id
// @access  Private (Admin only)
const updateInsurance = async (req, res) => {
    try {
        const insurance = await insuranceService.updateInsurance(req.params.id, req.body, req.user._id, req.user.role);
        res.status(200).json(insurance);
    } catch (error) {
        if (error.message === 'Insurance record not found') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'Only administrators can update insurance records') {
            res.status(403).json({ message: error.message });
        } else if (error.message.includes('must be') || error.message.includes('required')) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Get insurance by ID
// @route   GET /api/insurances/:id
// @access  Private
const getInsuranceById = async (req, res) => {
    try {
        const insurance = await insuranceService.getInsuranceById(req.params.id);
        if (!insurance) {
            return res.status(404).json({ message: 'Insurance record not found' });
        }
        res.status(200).json(insurance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInsurance,
    getInsurances,
    deleteInsurance,
    updateInsurance,
    getInsuranceById,
};
