import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    useGetUsersQuery,
    useToggleBlockStatusMutation,
    useResetPasswordMutation,
} from '../features/users/usersApiSlice'
import { Plus, UserX, UserCheck, Shield, Key, Loader, Mail, Phone, ChevronLeft } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { useNavigate } from 'react-router-dom'

const StaffList = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const { data, isLoading, error, refetch } = useGetUsersQuery({ page, limit: 10 })
    const [toggleBlockStatus] = useToggleBlockStatusMutation()
    const [resetPassword] = useResetPasswordMutation()
    const { showToast } = useToast()

    const users = data?.users || []
    const total = data?.total || 0
    const pages = data?.pages || 0

    // Simple state for Password Reset Modal
    const [resetModalOpen, setResetModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)
    const [newPassword, setNewPassword] = useState('')

    // State for Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        id: null,
        currentStatus: false
    })

    const handleBlockToggle = async (id, currentStatus) => {
        setConfirmModal({
            isOpen: true,
            id,
            currentStatus
        })
    }

    const confirmBlockToggle = async () => {
        const { id, currentStatus } = confirmModal
        const action = currentStatus ? 'BLOCK' : 'UNBLOCK'
        setUpdatingId(id)
        setConfirmModal({ ...confirmModal, isOpen: false })

        try {
            await toggleBlockStatus(id).unwrap()
            showToast({ message: `User ${action === 'BLOCK' ? 'blocked' : 'unblocked'} successfully`, type: 'success' })
            // Force reload to verify backend state immediately (as per existing logic)
            window.location.reload()
        } catch (err) {
            showToast({ message: 'Failed to update status: ' + (err.data?.message || err.message), type: 'error' })
        } finally {
            setUpdatingId(null)
        }
    }

    const openResetModal = (user) => {
        setSelectedUser(user)
        setNewPassword('')
        setResetModalOpen(true)
    }

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            showToast({ message: 'Password must be at least 6 characters', type: 'error' })
            return
        }
        try {
            await resetPassword({ id: selectedUser._id, password: newPassword }).unwrap()
            showToast({ message: 'Password reset successfully', type: 'success' })
            setResetModalOpen(false)
        } catch (err) {
            showToast({ message: 'Failed to reset password: ' + (err.data?.message || err.message), type: 'error' })
        }
    }

    if (isLoading) return <div className="flex justify-center mt-10"><Loader className="animate-spin text-blue-900" size={32} /></div>
    if (error) return <div className="text-center text-red-500 mt-10">Error loading staff data</div>

    return (
        <div className="pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mr-4 p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-blue-900 hover:border-blue-100 transition-all active:scale-95 md:hidden"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 leading-none">Staff Management</h1>
                        <p className="text-gray-500 text-sm font-medium mt-1">Monitor and control staff access</p>
                    </div>
                </div>
                <Link
                    to="/admin/add-staff"
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/10 active:scale-95 font-bold w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Staff
                </Link>
            </div>

            <div className="mb-6 text-sm text-gray-600 font-bold bg-gray-50 inline-block px-4 py-1.5 rounded-full border border-gray-100">
                TOTAL: {total} STAFF MEMBERS
            </div>

            {/* Mobile View: Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {users?.map((user) => (
                    <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-black text-gray-900">{user.username}</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-purple-500' : 'text-blue-500'
                                        }`}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${user.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                {user.isActive ? 'Active' : 'Blocked'}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                                <Phone size={14} className="text-gray-400" />
                                {user.mobileNumber || 'No mobile number'}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {user.role !== 'admin' && (
                                <>
                                    <button
                                        onClick={() => openResetModal(user)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-all active:scale-95"
                                    >
                                        <Key size={16} />
                                        RESET KEY
                                    </button>
                                    <button
                                        onClick={() => handleBlockToggle(user._id, user.isActive)}
                                        disabled={updatingId === user._id}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 ${user.isActive
                                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                            }`}
                                    >
                                        {updatingId === user._id ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                                {user.isActive ? 'BLOCK' : 'UNBLOCK'}
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <div className="flex-1 text-center py-2.5 text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-50 rounded-xl italic">
                                    System Administrator
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop View: Table Layout */}
            <div className="hidden md:block bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Username</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Mobile</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {users?.map((user) => (
                            <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {user.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                    {user.mobileNumber || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-black uppercase rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
                                            {user.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                    {user.role !== 'admin' && (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openResetModal(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                title="Reset Password"
                                            >
                                                <Key size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleBlockToggle(user._id, user.isActive)}
                                                disabled={updatingId === user._id}
                                                className={`p-2 rounded-lg transition-all active:scale-95 ${user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.isActive ? 'Block User' : 'Unblock User'}
                                            >
                                                {updatingId === user._id ? (
                                                    <Loader className="animate-spin" size={18} />
                                                ) : (
                                                    user.isActive ? <UserX size={18} /> : <UserCheck size={18} />
                                                )}
                                            </button>
                                        </div>
                                    )}
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

            {/* Reset Password Modal */}
            {resetModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResetModalOpen(false)} />
                    <div className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit mb-6">
                            <Key size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Reset Key</h3>
                        <p className="text-gray-500 font-medium mb-6">Enter a new secure password for <span className="text-blue-600 font-bold">{selectedUser?.username}</span></p>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl mb-6 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold"
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setResetModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                className="flex-2 px-6 py-3 bg-blue-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmBlockToggle}
                title={`${confirmModal.currentStatus ? 'Block' : 'Unblock'} Access`}
                message={
                    <div className="space-y-4">
                        <p>Are you sure you want to {confirmModal.currentStatus ? 'block' : 'unblock'} access for this staff member?</p>
                        <div className={`p-4 rounded-xl border ${confirmModal.currentStatus ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                            <div className={`text-xs font-black uppercase mb-1 ${confirmModal.currentStatus ? 'text-red-400' : 'text-green-400'}`}>Staff Member</div>
                            <div className={`font-bold ${confirmModal.currentStatus ? 'text-red-900' : 'text-green-900'}`}>
                                {users?.find(u => u._id === confirmModal.id)?.username}
                            </div>
                        </div>
                    </div>
                }
                confirmText={confirmModal.currentStatus ? 'Block Access' : 'Restore Access'}
                variant={confirmModal.currentStatus ? 'danger' : 'primary'}
            />
        </div>
    )
}

export default StaffList
