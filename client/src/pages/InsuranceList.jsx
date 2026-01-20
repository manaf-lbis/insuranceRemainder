import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetInsurancesQuery, useSendReminderMutation, useDeleteInsuranceMutation } from '../features/insurance/insuranceApiSlice'
import { ChevronLeft, Plus, Loader, Filter, Send, X, Search, Trash2, Edit2, Calendar, CheckCircle, SlidersHorizontal, ArrowUp } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'
import BottomSheet from '../components/BottomSheet'

const InsuranceList = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Initialize filter from URL or empty
    const initialStatus = searchParams.get('status') || ''
    const [statusFilter, setStatusFilter] = useState(initialStatus)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)

    // Mobile specific state
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
    const [showSearchInput, setShowSearchInput] = useState(false)

    // Date Range State
    const [expiryFrom, setExpiryFrom] = useState('')
    const [expiryTo, setExpiryTo] = useState('')
    // Staged state for manual apply
    const [stagedFrom, setStagedFrom] = useState('')
    const [stagedTo, setStagedTo] = useState('')
    const [dateError, setDateError] = useState('')

    // Reset page when filter or search changes
    useEffect(() => {
        setPage(1)
    }, [statusFilter, debouncedSearch, expiryFrom, expiryTo])

    const [selectedInsurance, setSelectedInsurance] = useState(null)
    const [insuranceToDelete, setInsuranceToDelete] = useState(null)

    const [sendReminder, { isLoading: isSending }] = useSendReminderMutation()
    const [deleteInsurance, { isLoading: isDeleting }] = useDeleteInsuranceMutation()

    const { user } = useSelector((state) => state.auth)

    // Debounce Search Input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Sync Status Filter with URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (statusFilter) {
            params.set('status', statusFilter);
        } else {
            params.delete('status');
        }
        setSearchParams(params, { replace: true });
    }, [statusFilter])

    const { data, isLoading, isError, error } = useGetInsurancesQuery({
        status: statusFilter,
        search: debouncedSearch,
        page,
        limit: 10,
        expiryFrom,
        expiryTo
    })

    const insurances = data?.insurances || []
    const total = data?.total || 0
    const pages = data?.pages || 0

    const { showToast } = useToast()

    const handleSendClick = (insurance) => {
        setSelectedInsurance(insurance)
    }

    const handleDeleteClick = (insurance) => {
        setInsuranceToDelete(insurance)
    }

    const confirmSendReminder = async () => {
        if (!selectedInsurance) return

        try {
            await sendReminder(selectedInsurance._id).unwrap()
            showToast({ message: `Reminder sent successfully to ${selectedInsurance.customerName}`, type: 'success' })
            setSelectedInsurance(null)
        } catch (err) {
            showToast({ message: `Failed to send reminder: ${err?.data?.message || err.message}`, type: 'error' })
        }
    }

    const confirmDelete = async () => {
        if (!insuranceToDelete) return

        try {
            await deleteInsurance(insuranceToDelete._id).unwrap()
            showToast({ message: 'Insurance record deleted successfully', type: 'success' })
            setInsuranceToDelete(null)
        } catch (err) {
            showToast({ message: `Failed to delete: ${err?.data?.message || err.message}`, type: 'error' })
        }
    }

    // Date Filter Handlers
    const handleApplyDateFilter = () => {
        setDateError('')

        if (stagedFrom && stagedTo) {
            if (new Date(stagedFrom) > new Date(stagedTo)) {
                setDateError('From Date cannot be after To Date')
                return
            }
        }

        setExpiryFrom(stagedFrom)
        setExpiryTo(stagedTo)
        setIsFilterSheetOpen(false) // Close sheet on mobile apply
    }

    const handleClearDateFilter = () => {
        setStagedFrom('')
        setStagedTo('')
        setExpiryFrom('')
        setExpiryTo('')
        setDateError('')
    }

    const isEligibleForReminder = (daysRemaining) => {
        return daysRemaining >= 0 && daysRemaining <= 30
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'EXPIRED':
                return 'bg-red-50 text-red-700 border border-red-200'
            case 'EXPIRING_SOON':
                return 'bg-order-orange-50 text-orange-700 border border-orange-200'
            case 'EXPIRING_WARNING':
                return 'bg-amber-50 text-amber-700 border border-amber-200'
            case 'EXPIRING_UPCOMING':
                return 'bg-blue-50 text-blue-700 border border-blue-200'
            case 'ACTIVE':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            default:
                return 'bg-gray-100 text-gray-700 border border-gray-200'
        }
    }

    const formatStatus = (status) => {
        if (!status) return 'Unknown'
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    const chipFilters = [
        { label: 'All', value: '' },
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Expiring', value: 'EXPIRING_SOON' },
        { label: 'Expired', value: 'EXPIRED' },
    ]

    let content

    if (isLoading) {
        content = (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-blue-900" />
            </div>
        )
    } else if (isError) {
        content = (
            <div className="text-center text-red-500 py-8 bg-white rounded-2xl shadow-sm border border-red-100 p-8 mx-4 md:mx-0">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load data</h3>
                <p className="text-gray-500">{error?.data?.message || error.message}</p>
            </div>
        )
    } else if (insurances?.length === 0) {
        content = (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center mx-4 md:mx-0">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <Search className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">No records found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8 px-4">
                    Try adjusting your filters or add a new record to get started.
                </p>
                <button
                    onClick={() => navigate('/add-insurance')}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center"
                >
                    <Plus size={18} className="mr-2" />
                    Add First Insurance
                </button>
            </div>
        )
    } else {
        content = (
            <>
                {/* Mobile View: Modern Card Layout */}
                <div className="grid grid-cols-1 gap-4 md:hidden pb-20 px-4">
                    {insurances.map((insurance) => (
                        <div
                            key={insurance._id}
                            onClick={(e) => {
                                // Prevent navigation if clicking buttons
                                if (e.target.closest('button')) return;
                                // Optional: Navigate to detail view if exists, for now just no-op or maybe expand
                            }}
                            className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-gray-50 active:scale-[0.99] transition-transform duration-200"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-wider">
                                            {insurance.registrationNumber}
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 leading-tight font-poppins">
                                        {insurance.customerName}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusStyle(insurance.expiryStatus)}`}>
                                    {formatStatus(insurance.expiryStatus)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Expires On</div>
                                    <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(insurance.policyExpiryDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Time Left</div>
                                    <div className={`text-sm font-black ${insurance.daysRemaining <= 30 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {insurance.daysRemaining} Days
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 flex items-center justify-between pt-3 border-t border-gray-50 mb-4">
                                <span className="font-medium">{insurance.vehicleType} • {insurance.insuranceType}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSendClick(insurance)}
                                    disabled={!isEligibleForReminder(insurance.daysRemaining)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isEligibleForReminder(insurance.daysRemaining)
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={16} />
                                    <span>Remind</span>
                                </button>

                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => navigate(`/edit-insurance/${insurance._id}`)}
                                        className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all active:scale-95 border border-blue-100"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    <div className="mt-4 pb-20">
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                </div>

                {/* Desktop View: Premium Table Layout */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Policy Holder</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Registration</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Expiry Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Vehicle</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider font-inter">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {insurances.map((insurance) => (
                                <tr key={insurance._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusStyle(insurance.expiryStatus)}`}>
                                                {formatStatus(insurance.expiryStatus)}
                                            </span>
                                            <span className="text-xs font-semibold text-gray-400 ml-1">{insurance.daysRemaining} days left</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{insurance.customerName}</span>
                                            <span className="text-xs text-gray-500">{insurance.mobileNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            {insurance.registrationNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm font-medium text-gray-700">
                                            <Calendar size={14} className="mr-2 text-gray-400" />
                                            {new Date(insurance.policyExpiryDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900">{insurance.vehicleType}</span>
                                            <span className="text-[10px] uppercase font-bold text-gray-400">{insurance.insuranceType}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleSendClick(insurance)}
                                                disabled={!isEligibleForReminder(insurance.daysRemaining)}
                                                className={`p-2 rounded-lg transition-all ${isEligibleForReminder(insurance.daysRemaining)
                                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer active:scale-95'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                    }`}
                                                title={isEligibleForReminder(insurance.daysRemaining) ? "Send Reminder" : "Unavailable (Too early/expired)"}
                                            >
                                                <Send size={18} />
                                            </button>

                                            {(user?.role === 'admin' || insurance.createdBy === user?._id || insurance.createdBy?._id === user?._id) && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/edit-insurance/${insurance._id}`)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(insurance)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-6 px-6 pb-6">
                        <Pagination
                            currentPage={page}
                            totalPages={pages}
                            onPageChange={(newPage) => setPage(newPage)}
                        />
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className="md:pb-20">
            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
                <div className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/dashboard')} className="p-1 -ml-1 text-gray-500">
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-lg font-bold text-gray-900 font-poppins">Insurances</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSearchInput(!showSearchInput)}
                            className={`p-2 rounded-full transition-colors ${showSearchInput ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={() => setIsFilterSheetOpen(true)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative"
                        >
                            <SlidersHorizontal size={20} />
                            {(expiryFrom || expiryTo || (statusFilter && !chipFilters.some(c => c.value === statusFilter))) && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar Expansion */}
                {showSearchInput && (
                    <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search policies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                autoFocus
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                )}

                {/* Mobile Status Chips */}
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                    {chipFilters.map((chip) => (
                        <button
                            key={chip.label}
                            onClick={() => setStatusFilter(chip.value === statusFilter ? '' : chip.value)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${statusFilter === chip.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-6 lg:px-8">
                {/* Desktop Header */}
                <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-poppins tracking-tight">Insurances</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            Manage and track all policies
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="font-semibold text-gray-700">{total} Total Records</span>
                        </p>
                    </div>
                </div>

                {/* Desktop Navbar/Filters (Hidden on Mobile) */}
                <div className="hidden md:block sticky top-20 z-30 bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-2 mb-8 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-2">
                        {/* Search */}
                        <div className="relative flex-grow lg:flex-grow-[2]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, reg no, or mobile..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder-gray-400"
                            />
                        </div>

                        <div className="w-px bg-gray-100 hidden lg:block my-2"></div>

                        {/* Status Filter */}
                        <div className="relative flex-grow lg:flex-grow-0 lg:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Filter size={18} />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:bg-white cursor-pointer appearance-none"
                            >
                                <option value="">All Statuses</option>
                                <option value="ACTIVE">Active Policies</option>
                                <option value="EXPIRING_UPCOMING">Upcoming (&gt;15 Days)</option>
                                <option value="EXPIRING_WARNING">Warning (8-15 Days)</option>
                                <option value="EXPIRING_SOON">Expiring Soon (&lt;7 Days)</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                        </div>

                        <div className="w-px bg-gray-100 hidden lg:block my-2"></div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 flex-grow lg:flex-grow-0">
                            <input
                                type="date"
                                value={stagedFrom}
                                onChange={(e) => setStagedFrom(e.target.value)}
                                className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:ring-0 w-full lg:w-32 py-2"
                            />
                            <span className="text-gray-300 text-[10px]">TO</span>
                            <input
                                type="date"
                                value={stagedTo}
                                onChange={(e) => setStagedTo(e.target.value)}
                                className="bg-transparent border-none text-xs font-semibold text-gray-700 focus:ring-0 w-full lg:w-32 py-2"
                            />
                            <button
                                onClick={handleApplyDateFilter}
                                className="bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-lg shadow-sm border border-gray-200 transition-all active:scale-95"
                                title="Apply Date Filter"
                            >
                                <CheckCircle size={16} />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 lg:ml-auto">
                            {(expiryFrom || expiryTo || statusFilter || searchQuery) && (
                                <button
                                    onClick={() => {
                                        setStatusFilter('')
                                        setSearchQuery('')
                                        handleClearDateFilter()
                                    }}
                                    className="px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center"
                                >
                                    Reset
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/add-insurance')}
                                className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center whitespace-nowrap"
                            >
                                <Plus size={20} className="mr-2" />
                                New Insurance
                            </button>
                        </div>
                    </div>
                </div>

                {content}

                {/* FAB (Mobile Only) */}
                <button
                    onClick={() => navigate('/add-insurance')}
                    className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-tr from-blue-700 to-blue-500 text-white rounded-full shadow-lg shadow-blue-600/40 flex items-center justify-center z-40 active:scale-90 transition-transform"
                >
                    <Plus size={28} />
                </button>

                {/* Mobile Filter Bottom Sheet */}
                <BottomSheet
                    isOpen={isFilterSheetOpen}
                    onClose={() => setIsFilterSheetOpen(false)}
                    title="Filter Policies"
                >
                    <div className="space-y-6">
                        {/* Status Filter in Sheet */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['ACTIVE', 'EXPIRING_SOON', 'EXPIRING_WARNING', 'EXPIRED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
                                        className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all ${statusFilter === status
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {formatStatus(status)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date Filter in Sheet */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">Expiry Date Range</label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <span className="text-xs text-gray-400 font-semibold mb-1 block">From</span>
                                    <input
                                        type="date"
                                        value={stagedFrom}
                                        onChange={(e) => setStagedFrom(e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs text-gray-400 font-semibold mb-1 block">To</span>
                                    <input
                                        type="date"
                                        value={stagedTo}
                                        onChange={(e) => setStagedTo(e.target.value)}
                                        className="w-full bg-gray-50 border-gray-200 rounded-xl text-sm font-bold focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {dateError && <p className="text-red-500 text-xs mt-2 font-bold">{dateError}</p>}
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                onClick={handleClearDateFilter}
                                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApplyDateFilter}
                                className="flex-[2] py-3 text-white font-bold bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </BottomSheet>

                {/* Send Reminder Confirmation Modal */}
                {selectedInsurance && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                    <Send size={24} />
                                </div>
                                <button onClick={() => setSelectedInsurance(null)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-2 font-poppins">Send Reminder?</h3>
                                <p className="text-gray-500 font-medium mb-6">You are about to send a WhatsApp reminder for this policy.</p>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                                    <div>
                                        <div className="text-[10px] uppercase font-black text-gray-400">Customer</div>
                                        <div className="font-bold text-gray-800">{selectedInsurance.customerName}</div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-gray-400">Reg No</div>
                                            <div className="font-bold text-gray-800">{selectedInsurance.registrationNumber}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase font-black text-gray-400">Expires In</div>
                                            <div className="font-black text-blue-600 underline underline-offset-4">{selectedInsurance.daysRemaining} Days</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setSelectedInsurance(null)}
                                    className="flex-1 py-3.5 text-gray-700 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSendReminder}
                                    disabled={isSending}
                                    className="flex-2 py-3.5 px-8 text-white bg-blue-900 rounded-2xl font-bold hover:bg-black flex items-center justify-center transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                >
                                    {isSending ? (
                                        <Loader size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={20} className="mr-2" />
                                            Confirm Send
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={!!insuranceToDelete}
                    onClose={() => setInsuranceToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Insurance Record"
                    message={
                        <div className="space-y-4">
                            <p>Are you sure you want to delete this record? This action cannot be easily undone.</p>
                            {insuranceToDelete && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <div className="text-xs font-black text-red-400 uppercase mb-1">Deleting Policy for</div>
                                    <div className="font-bold text-red-900">{insuranceToDelete.customerName}</div>
                                    <div className="text-sm text-red-700 font-medium">#{insuranceToDelete.registrationNumber}</div>
                                </div>
                            )}
                        </div>
                    }
                    confirmText={isDeleting ? "Deleting..." : "Delete Permanently"}
                    variant="danger"
                />
            </div>
        </div>
    )
}

export default InsuranceList
