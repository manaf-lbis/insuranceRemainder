import React, { useState } from 'react';
import { checkInsuranceStatus } from '../features/publicInsurance/publicInsuranceAPI';
import { Shield, Search, CheckCircle, Clock, AlertTriangle, ShieldAlert, Car, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

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

        if (!searchValue.trim()) {
            setError('Please enter a value to search');
            return;
        }

        setLoading(true);

        try {
            const response = await checkInsuranceStatus(searchType, searchValue.trim());
            let resultsData = [];
            if (Array.isArray(response.data)) {
                resultsData = response.data;
            } else if (response.data && typeof response.data === 'object') {
                resultsData = [response.data];
            } else {
                setError('Invalid response from server');
                return;
            }
            setResults(resultsData);
        } catch (err) {
            setError(err.message || 'Unable to check insurance status');
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">
            {/* 1. Header (Match AdminDashboard Style) */}
            <header className="bg-blue-900 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white font-poppins tracking-wide">
                            CSC Insurance Tracker
                        </span>
                    </div>
                    <a
                        href="/login"
                        className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-md"
                    >
                        Staff Login
                    </a>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* 2. Page Title Section */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins">
                        Insurance Status
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-500">
                        Check vehicle insurance quickly and securely.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3. Search Card (Left Column) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                    Search Insurance
                                </h2>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    {/* Tabs */}
                                    <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => { setSearchType('vehicle'); setSearchValue(''); setResults([]); setError(''); }}
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${searchType === 'vehicle'
                                                ? 'bg-white text-blue-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Car size={16} />
                                            Vehicle
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setSearchType('mobile'); setSearchValue(''); setResults([]); setError(''); }}
                                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${searchType === 'mobile'
                                                ? 'bg-white text-blue-900 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <Phone size={16} />
                                            Mobile
                                        </button>
                                    </div>

                                    {/* Input */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {searchType === 'vehicle' ? 'Vehicle Number' : 'Mobile Number'}
                                        </label>
                                        <input
                                            type="text"
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                                            placeholder={searchType === 'vehicle' ? 'e.g., KL01AB1234' : 'e.g., 9876543210'}
                                            className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Primary Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Searching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search size={18} />
                                                <span>Search Records</span>
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
                                            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* 4. Results Section (Right Column) */}
                    <div className="lg:col-span-2">
                        {results.length > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-emerald-500 rounded-full"></div>
                                    Search Results ({results.length})
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {results.map((vehicle, index) => (
                                        <ResultCard key={index} vehicle={vehicle} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Empty State / Info Placeholder */
                            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center text-gray-400 min-h-[300px]">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Shield className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-gray-900 font-medium mb-1">No Results Yet</h3>
                                <p className="text-sm max-w-xs mx-auto">
                                    Enter a vehicle or mobile number to verify insurance status.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} CSC Insurance Services. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

/**
 * Modernized Result Card
 * Clean, polished, and professional look
 */
const ResultCard = ({ vehicle }) => {
    const days = vehicle.daysToExpiry !== null && vehicle.daysToExpiry !== undefined ? vehicle.daysToExpiry : 0;
    const isExpired = vehicle.insuranceStatus === 'EXPIRED';
    const isExpiring = vehicle.insuranceStatus === 'EXPIRING';

    // Status Configuration
    let config = {
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50/50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        icon: CheckCircle,
        label: 'Active Policy',
        statusColor: 'text-emerald-600'
    };

    if (isExpired) {
        config = {
            gradient: 'from-rose-500 to-red-600',
            bg: 'bg-rose-50/50',
            text: 'text-rose-700',
            border: 'border-rose-100',
            icon: ShieldAlert,
            label: 'Policy Expired',
            statusColor: 'text-rose-600'
        };
    } else if (isExpiring) {
        config = {
            gradient: 'from-amber-400 to-orange-500',
            bg: 'bg-amber-50/50',
            text: 'text-amber-800',
            border: 'border-amber-100',
            icon: AlertTriangle,
            label: 'Expiring Soon',
            statusColor: 'text-amber-600'
        };
    }

    const Icon = config.icon;

    return (
        <div className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border ${config.border} overflow-hidden`}>
            {/* Decorative Top Line */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${config.gradient}`}></div>

            <div className="p-6">
                {/* Header: Vehicle & Status */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${config.bg} ${config.statusColor}`}>
                            <Car className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Vehicle Number</p>
                            <h3 className="text-xl font-bold text-gray-900 font-mono tracking-tight">
                                {vehicle.maskedVehicleNumber?.toUpperCase()}
                            </h3>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${config.border} ${config.bg} ${config.text} uppercase tracking-wide`}>
                        {config.label}
                    </div>
                </div>

                {/* Hero Metric: Days */}
                <div className="flex items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl md:text-5xl font-extrabold ${config.statusColor} tracking-tight`}>
                                {Math.abs(days)}
                            </span>
                            <span className={`text-sm font-semibold uppercase tracking-wide ${config.text} opacity-80`}>
                                {isExpired ? 'Days Ago' : 'Days Left'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Details */}
            <div className="bg-gray-50/80 p-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                        Valid until: <span className="text-gray-900 font-semibold">{new Date(vehicle.policyExpiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                </div>
                {/* Optional: Add an action arrow or icon */}
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center ${config.statusColor} opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1`}>
                    <Icon className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

export default PublicInsuranceCheck;
