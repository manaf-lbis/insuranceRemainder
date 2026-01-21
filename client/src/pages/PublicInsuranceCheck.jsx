import React, { useState } from 'react';
import { checkInsuranceStatus } from '../features/publicInsurance/publicInsuranceAPI';
import { Shield, Search, CheckCircle, Clock, AlertTriangle, ShieldAlert, Car, Phone, MessageCircle, MapPin, ExternalLink, HelpCircle, Users, ClipboardCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicInsuranceCheck = () => {
    const [searchType, setSearchType] = useState('vehicle');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResults([]);
        setHasSearched(false);

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
            setHasSearched(true);
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
                            Notify CSC
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
                        ) : hasSearched ? (
                            /* EMPATHETIC EMPTY STATE (Search Performed but No Results) */
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-blue-100 overflow-hidden relative">
                                    <div className="p-8 md:p-10 flex flex-col items-center text-center">
                                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-blue-50/50">
                                            <HelpCircle className="w-10 h-10 text-blue-600" />
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-3 font-poppins">
                                            Not finding your records?
                                        </h3>
                                        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed font-medium">
                                            Records for new policies or policies purchased from other agencies might not reflect here instantly. Don't worry, we can help you verify this manually.
                                        </p>

                                        {/* Conversion Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                            <a
                                                href="tel:9633565414"
                                                className="group flex items-center gap-4 p-5 bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                                            >
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                                                    <Phone size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-100">Call Support</p>
                                                    <p className="text-lg font-black text-white leading-tight">9633565414</p>
                                                </div>
                                                <ArrowRight className="ml-auto text-blue-100 group-hover:translate-x-1 transition-transform" size={20} />
                                            </a>

                                            <a
                                                href="https://wa.me/919633565414?text=Hi%20I%20need%20help%20with%20insurance"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-4 p-5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                                            >
                                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0">
                                                    <MessageCircle size={24} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-50">WhatsApp Us</p>
                                                    <p className="text-lg font-black text-white leading-tight">Chat Now</p>
                                                </div>
                                                <ArrowRight className="ml-auto text-emerald-50 group-hover:translate-x-1 transition-transform" size={20} />
                                            </a>
                                        </div>

                                        {/* Physical Office Option */}
                                        <div className="mt-8 pt-8 border-t border-gray-100 w-full">
                                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-500 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-blue-500" />
                                                    <span>Visit Common Service Centre, Ammaveedu Jn</span>
                                                </div>
                                                <span className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <div className="flex items-center gap-2 text-blue-600 font-bold">
                                                    Open 9 AM - 6 PM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Urgency Banner */}
                                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                                    <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                                    <p className="text-sm font-bold text-amber-900 leading-tight">
                                        Driving without valid insurance is a legal offense. Let us help you fix this today.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Initial Placeholder */
                            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center group">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <Shield className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2 font-poppins">Verify Your Policy</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
                                    Enter your registration or mobile number to quickly check the status of your vehicle insurance.
                                </p>

                                {/* Credibility Grid */}
                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="p-4 rounded-xl border border-gray-50 bg-gray-50/30 text-left">
                                        <ClipboardCheck className="text-blue-600 mb-2" size={20} />
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-bold text-gray-800">Quick Check</p>
                                    </div>
                                    <div className="p-4 rounded-xl border border-gray-50 bg-gray-50/30 text-left">
                                        <Users className="text-blue-600 mb-2" size={20} />
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Support</p>
                                        <p className="text-sm font-bold text-gray-800">Expert Advice</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-gray-900 font-poppins mb-1">Notify CSC</h3>
                            <p className="text-sm text-gray-500">
                                Common Service Centre, Ammaveedu jn
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-1">
                            <p className="text-sm font-semibold text-gray-700">Contact Us</p>
                            <p className="text-sm text-gray-500 font-medium tracking-wide">
                                9633565414, 9539791670
                            </p>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-400">
                            &copy; {new Date().getFullYear()} Notify CSC. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp CTA */}
            <div className="fixed bottom-6 right-6 z-[100] group flex flex-col items-end gap-3 pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-auto bg-white/90 backdrop-blur shadow-xl border border-emerald-100 rounded-2xl p-3 pr-4 mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                        <MessageCircle size={16} />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Need help?</p>
                        <p className="text-xs font-bold text-slate-800">Chat with CSC Office</p>
                    </div>
                </div>

                <a
                    href="https://wa.me/919633565414?text=Hi%20I%20need%20help%20with%20insurance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto w-16 h-16 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group/btn"
                >
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20 group-hover:opacity-40"></div>
                    <MessageCircle size={32} />
                </a>
            </div>
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
