/**
 * Public Insurance API
 * API service for public insurance status checks
 * NO AUTHENTICATION REQUIRED
 */

// Use environment variable for API URL (defaults to proxy /api if not set)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Check insurance status by vehicle number or mobile number
 * @param {string} searchType - 'vehicle' or 'mobile'
 * @param {string} searchValue - Vehicle registration number or mobile number
 */
export const checkInsuranceStatus = async (searchType, searchValue) => {
    try {
        const requestBody = {
            searchType,
        };

        // Add appropriate field based on search type
        if (searchType === 'vehicle') {
            requestBody.vehicleNumber = searchValue;
        } else if (searchType === 'mobile') {
            requestBody.mobileNumber = searchValue;
        }

        const response = await fetch(`${API_BASE_URL}/public/check-insurance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to check insurance status');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
