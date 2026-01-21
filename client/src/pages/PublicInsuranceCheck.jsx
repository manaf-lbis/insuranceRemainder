import React, { useState } from 'react';
import { checkInsuranceStatus } from '../features/publicInsurance/publicInsuranceAPI';
import { Shield, Search, CheckCircle, Clock, AlertTriangle, ShieldAlert, Car, Phone, MessageCircle, MapPin, ExternalLink, HelpCircle, Users, ClipboardCheck, ArrowRight, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicInsuranceCheck = () => {
    const [searchType, setSearchType] = useState('vehicle');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');

    const [hasSearched, setHasSearched] = useState(false);
    const { user } = useSelector((state) => state.auth);

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
            <header className="bg-blue-900 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white font-poppins tracking-wide">
                            Notify CSC
                        </span>
                    </div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:block text-sm text-blue-100">
                                Welcome, <span className="font-semibold text-white">{user.username}</span>
                            </span>
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium border border-white/10"
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
                        >
                            Staff Login
                        </Link>
                    )}
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
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
                                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
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
                            /* EMPATHETIC EMPTY STATE (Refined Conversion Funnel) */
                            <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                                {/* 1. PRIMARY EMPTY STATE: Help-oriented message */}
                                <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/10 border border-blue-50 overflow-hidden relative group">
                                    {/* Decorative background blur */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full filter blur-[80px] opacity-50 -z-10 transition-opacity group-hover:opacity-75"></div>

                                    <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                                            <HelpCircle className="w-10 h-10 text-blue-600" />
                                        </div>

                                        <h3 className="text-2xl font-black text-slate-800 mb-2 font-poppins">
                                            No Insurance Records Found
                                        </h3>
                                        <p className="text-slate-500 max-w-lg mx-auto mb-10 font-medium leading-relaxed">
                                            We couldn't find a record for this number. This might happen if your policy was recently renewed or is not yet updated in our system.
                                        </p>

                                        {/* Primary Conversion Card */}
                                        <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-900/20 p-1 mb-8 overflow-hidden">
                                            <div className="bg-white rounded-xl p-6 md:p-8">
                                                <div className="flex flex-col md:flex-row gap-8 justify-between items-center">

                                                    {/* Contact Details */}
                                                    <div className="space-y-6 text-left w-full md:w-auto">
                                                        <div className="flex items-center gap-4 group/item">
                                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300">
                                                                <Phone size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Call Support</p>
                                                                <a href="tel:9633565414" className="text-xl md:text-2xl font-black text-gray-900 hover:text-blue-700 transition-colors">
                                                                    9633565414
                                                                </a>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 group/item">
                                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300">
                                                                <MapPin size={24} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Visit Today</p>
                                                                <p className="text-base font-bold text-gray-900">CSC, Ammaveedu Jn</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* CTA Button */}
                                                    <div className="w-full md:w-auto flex flex-col gap-3">
                                                        <a
                                                            href="tel:9633565414"
                                                            className="w-full md:w-auto px-8 py-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-blue-900/20 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                                                        >
                                                            <Phone size={18} />
                                                            Get Insurance Help Now
                                                        </a>
                                                        <p className="text-[10px] text-center text-gray-400 font-medium">Wait time: &lt; 1 min</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. SECONDARY CONVERSION: For Hesitant Users */}
                                        <div className="w-full pt-8 border-t border-gray-100">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                <div className="text-center md:text-left">
                                                    <p className="text-base font-bold text-gray-900 mb-1">Unsure about your status?</p>
                                                    <p className="text-sm text-gray-500">Bring your vehicle documents to our office for a free check.</p>
                                                </div>
                                                <a
                                                    href="https://wa.me/919633565414?text=Hi%20I%20want%20to%20verify%20my%20insurance%20at%20CSC"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-blue-700 font-bold text-sm hover:gap-3 transition-all bg-white px-5 py-2.5 rounded-lg border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-300"
                                                >
                                                    <MessageCircle size={18} />
                                                    Ask on WhatsApp
                                                    <ArrowRight size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
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
