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
            res.status(500).json({ message: error.message });
        }
    }
};

// @desc    Get all insurances
// @route   GET /api/insurances
// @access  Private
const getInsurances = async (req, res) => {
    try {
        const insurances = await insuranceService.getAllInsurances();
        res.status(200).json(insurances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInsurance,
    getInsurances,
};
