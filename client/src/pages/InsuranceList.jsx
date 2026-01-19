import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetInsurancesQuery, useSendReminderMutation, useDeleteInsuranceMutation } from '../features/insurance/insuranceApiSlice'
import { ChevronLeft, Plus, Loader, Filter, Send, X, Search, Trash2 } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'

const InsuranceList = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    // Initialize filter from URL or empty
    const initialStatus = searchParams.get('status') || ''
    const [statusFilter, setStatusFilter] = useState(initialStatus)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [page, setPage] = useState(1)

    // Reset page when filter or search changes
    useEffect(() => {
        setPage(1)
    }, [statusFilter, debouncedSearch])

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

    // Sync URL param if it changes (e.g. browser back button)
    useEffect(() => {
        const currentStatus = searchParams.get('status') || ''
        if (currentStatus !== statusFilter) {
            setStatusFilter(currentStatus)
        }
    }, [searchParams])

    const { data, isLoading, isError, error } = useGetInsurancesQuery({
        status: statusFilter,
        search: debouncedSearch,
        page,
        limit: 10
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

    const isEligibleForReminder = (daysRemaining) => {
        return daysRemaining >= 0 && daysRemaining <= 30
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'EXPIRED':
                return 'bg-red-100 text-red-800 border-red-200'
            case 'EXPIRING_SOON':
                return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'EXPIRING_WARNING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'EXPIRING_UPCOMING':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatStatus = (status) => {
        if (!status) return 'Unknown'
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    let content

    if (isLoading) {
        content = (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-8 w-8 text-blue-900" />
            </div>
        )
    } else if (isError) {
        content = (
            <div className="text-center text-red-500 py-8">
                Error loading data: {error?.data?.message || error.message}
            </div>
        )
    } else if (insurances?.length === 0) {
        content = (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
                <p className="text-lg">No insurance records found for this filter.</p>
                <button
                    onClick={() => {
                        setStatusFilter('')
                        navigate('/add-insurance')
                    }}
                    className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
                >
                    {statusFilter ? 'Clear Filter' : 'Add First Record'}
                </button>
            </div>
        )
    } else {
        content = (
            <>
                <div className="mb-4 text-sm text-gray-600 font-medium">
                    Showing {insurances.length} of {total} records
                </div>

                {/* Mobile View: Card Layout */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {insurances.map((insurance) => (
                        <div key={insurance._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                        {insurance.registrationNumber}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                        {insurance.customerName}
                                    </div>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm ${getStatusStyle(insurance.expiryStatus)}`}>
                                    {formatStatus(insurance.expiryStatus)}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Expires On</div>
                                    <div className="text-sm font-semibold text-gray-700">
                                        {new Date(insurance.policyExpiryDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Remaining</div>
                                    <div className="text-sm font-semibold text-gray-700">
                                        {insurance.daysRemaining} Days
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 mb-4 border-l-2 border-blue-100 pl-3 italic">
                                {insurance.vehicleType} • {insurance.insuranceType}
                                <div className="text-xs text-gray-400 mt-0.5">Mob: {insurance.mobileNumber}</div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-gray-50">
                                <button
                                    onClick={() => handleSendClick(insurance)}
                                    disabled={!isEligibleForReminder(insurance.daysRemaining)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all active:scale-95 ${isEligibleForReminder(insurance.daysRemaining)
                                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <Send size={16} />
                                    <span>Remind</span>
                                </button>

                                {(user?.role === 'admin' || insurance.createdBy === user?._id || insurance.createdBy?._id === user?._id) && (
                                    <button
                                        onClick={() => handleDeleteClick(insurance)}
                                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all active:scale-95"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reg No</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                                {user?.role === 'admin' && (
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Entered By</th>
                                )}
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {insurances.map((insurance) => (
                                <tr key={insurance._id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border shadow-sm ${getStatusStyle(insurance.expiryStatus)}`}>
                                            {formatStatus(insurance.expiryStatus)}
                                        </span>
                                        <div className="text-[10px] uppercase font-bold text-gray-400 mt-1.5 ml-1">
                                            {insurance.daysRemaining} days left
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {insurance.registrationNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="font-bold text-gray-900">{insurance.customerName}</div>
                                        <div className="text-xs text-gray-500 font-medium">{insurance.mobileNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-bold">
                                        {new Date(insurance.policyExpiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-bold text-gray-800">{insurance.vehicleType}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">{insurance.insuranceType}</div>
                                    </td>
                                    {user?.role === 'admin' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {insurance.createdBy?.username || 'Unknown'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleSendClick(insurance)}
                                                disabled={!isEligibleForReminder(insurance.daysRemaining)}
                                                className={`p-2 rounded-lg transition-all ${isEligibleForReminder(insurance.daysRemaining)
                                                    ? 'text-blue-600 hover:bg-blue-100 cursor-pointer active:scale-95'
                                                    : 'text-gray-300 cursor-not-allowed opacity-50'
                                                    }`}
                                                title={isEligibleForReminder(insurance.daysRemaining) ? "Send Reminder" : "Unavailable"}
                                            >
                                                <Send size={18} />
                                            </button>

                                            {(user?.role === 'admin' || insurance.createdBy === user?._id || insurance.createdBy?._id === user?._id) && (
                                                <button
                                                    onClick={() => handleDeleteClick(insurance)}
                                                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={page}
                    totalPages={pages}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </>
        )
    }

    return (
        <div className="pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mr-4 p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-900 hover:border-blue-100 transition-all active:scale-95"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 leading-none">Insurances</h1>
                            <p className="text-gray-500 text-sm font-medium mt-1">Manage all policy records</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full sm:w-auto">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm w-full md:w-64 transition-all"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Filter size={18} />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm w-full md:w-48 appearance-none transition-all font-semibold text-gray-700"
                            >
                                <option value="">All Statuses</option>
                                <option value="EXPIRED">Expired</option>
                                <option value="EXPIRING_SOON">Expiring Soon (7 Days)</option>
                                <option value="EXPIRING_WARNING">Warning (8-15 Days)</option>
                                <option value="EXPIRING_UPCOMING">Upcoming (16-30 Days)</option>
                                <option value="ACTIVE">Active (>30 Days)</option>
                            </select>
                        </div>

                        <button
                            onClick={() => navigate('/add-insurance')}
                            className="flex items-center justify-center px-6 py-3 bg-blue-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-blue-900/10 active:scale-95 whitespace-nowrap font-bold"
                        >
                            <Plus size={20} className="mr-2" />
                            Add New
                        </button>
                    </div>
                </div>

                {content}

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
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Send Reminder?</h3>
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
