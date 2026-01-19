/**
 * Public Insurance Controller
 * Handles public insurance status check requests
 * NO AUTHENTICATION REQUIRED - PUBLIC ENDPOINT
 */

const publicInsuranceService = require('../services/publicInsuranceService');

/**
 * @desc    Check insurance status (public endpoint)
 * @route   POST /api/public/check-insurance
 * @access  Public (no authentication)
 */
const checkInsuranceStatus = async (req, res) => {
    try {
        const { searchType, vehicleNumber, mobileNumber } = req.body;

        // Validate input
        if (!searchType || (searchType !== 'vehicle' && searchType !== 'mobile')) {
            return res.status(400).json({
                message: 'Invalid search type. Use "vehicle" or "mobile".',
            });
        }

        let result = null;

        // Search by vehicle number
        if (searchType === 'vehicle') {
            if (!vehicleNumber) {
                return res.status(400).json({
                    message: 'Vehicle registration number is required',
                });
            }

            result = await publicInsuranceService.checkInsuranceByVehicle(vehicleNumber);
        }

        // Search by mobile number
        if (searchType === 'mobile') {
            if (!mobileNumber) {
                return res.status(400).json({
                    message: 'Mobile number is required',
                });
            }

            result = await publicInsuranceService.checkInsuranceByMobile(mobileNumber);
        }

        // Generic response if no record found
        if (!result) {
            return res.status(404).json({
                message: 'No insurance record found',
            });
        }

        // Return masked data (array of vehicles)
        res.status(200).json({
            success: true,
            data: result,
            count: result.length,
        });

    } catch (error) {
        // Generic error handling - don't reveal details
        console.error('Public insurance check error:', error);

        // Return generic error message
        res.status(500).json({
            message: 'Unable to process request. Please try again later.',
        });
    }
};

module.exports = {
    checkInsuranceStatus,
};
