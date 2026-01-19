import React, { useState } from 'react';
import { checkInsuranceStatus } from '../features/publicInsurance/publicInsuranceAPI';
import { Shield, Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

const PublicInsuranceCheck = () => {
    const [searchType, setSearchType] = useState('vehicle');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResults([]);

        // Validate input
        if (!searchValue.trim()) {
            setError('Please enter a value to search');
            return;
        }

        setLoading(true);

        try {
            const response = await checkInsuranceStatus(searchType, searchValue.trim());
            console.log('API Response:', response);
            console.log('Response data:', response.data);
            console.log('Data type:', typeof response.data);
            console.log('Is array:', Array.isArray(response.data));

            // Handle both array and object responses
            let resultsData = [];
            if (Array.isArray(response.data)) {
                resultsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                // If it's a single object, wrap it in an array
                resultsData = [response.data];
            } else {
                console.error('Invalid response format:', response);
                setError('Invalid response from server');
                return;
            }

            console.log('Setting results:', resultsData);
            setResults(resultsData);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message || 'Unable to check insurance status');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            ACTIVE: {
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: <CheckCircle className="w-4 h-4" />,
                text: 'Active',
            },
            EXPIRING: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: <Clock className="w-4 h-4" />,
                text: 'Expiring',
            },
            EXPIRED: {
                color: 'bg-red-100 text-red-800 border-red-300',
                icon: <XCircle className="w-4 h-4" />,
                text: 'Expired',
            },
        };

        const badge = badges[status] || badges.EXPIRED;

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${badge.color} text-sm font-semibold`}>
                {badge.icon}
                {badge.text}
            </div>
        );
    };

    const getDaysText = (daysToExpiry, status) => {
        // Fallback: if daysToExpiry is null or undefined, return unknown
        if (daysToExpiry === null || daysToExpiry === undefined || isNaN(daysToExpiry)) {
            return 'Contact office for details';
        }

        if (status === 'EXPIRED') {
            const daysExpired = Math.abs(daysToExpiry);
            return `Expired ${daysExpired} ${daysExpired === 1 ? 'day' : 'days'} ago`;
        } else {
            return `${daysToExpiry} ${daysToExpiry === 1 ? 'day' : 'days'} remaining`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/appIcon.png"
                            alt="CSC Logo"
                            className="h-20 w-20 rounded-xl shadow-lg"
                        />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Check Insurance Status
                    </h1>
                    <p className="text-gray-600">
                        Verify your vehicle insurance status quickly and securely
                    </p>
                    <p className="text-sm text-gray-500 mt-3">
                        Staff? <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium underline">Login here</a>
                    </p>
                </div>

                {/* Privacy Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <strong>Privacy Notice:</strong> For your safety, vehicle numbers are masked.
                    </div>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <form onSubmit={handleSubmit}>
                        {/* Search Type Toggle */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Search By
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="searchType"
                                        value="vehicle"
                                        checked={searchType === 'vehicle'}
                                        onChange={(e) => {
                                            setSearchType(e.target.value);
                                            setSearchValue('');
                                            setError('');
                                            setResults([]);
                                        }}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-700">Vehicle Number</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="searchType"
                                        value="mobile"
                                        checked={searchType === 'mobile'}
                                        onChange={(e) => {
                                            setSearchType(e.target.value);
                                            setSearchValue('');
                                            setError('');
                                            setResults([]);
                                        }}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-gray-700">Mobile Number</span>
                                </label>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {searchType === 'vehicle' ? 'Vehicle Registration Number' : 'Mobile Number'}
                            </label>
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                                placeholder={
                                    searchType === 'vehicle'
                                        ? 'e.g., KL01AB1234'
                                        : 'e.g., 9876543210'
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition uppercase"
                                disabled={loading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Check Status
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">{error}</div>
                    </div>
                )}

                {/* Results - Multiple Vehicles */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        {results.length > 1 && (
                            <div className="text-sm text-gray-600 font-medium">
                                Found {results.length} vehicles
                            </div>
                        )}

                        {results.map((vehicle, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    {/* Vehicle Number */}
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Vehicle Number
                                        </label>
                                        <p className="text-2xl font-mono font-bold text-gray-900">
                                            {vehicle.maskedVehicleNumber?.toUpperCase()}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        {getStatusBadge(vehicle.insuranceStatus)}
                                    </div>
                                </div>

                                {/* Days Info */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        <span className={`text-lg font-semibold ${vehicle.insuranceStatus === 'EXPIRED'
                                            ? 'text-red-600'
                                            : vehicle.insuranceStatus === 'EXPIRING'
                                                ? 'text-yellow-600'
                                                : 'text-green-600'
                                            }`}>
                                            {getDaysText(vehicle.daysToExpiry, vehicle.insuranceStatus)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Footer Note */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 text-center">
                                For complete details or to renew your insurance, please contact our office.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicInsuranceCheck;
