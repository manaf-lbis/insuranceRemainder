import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    useGetUsersQuery,
    useToggleBlockStatusMutation,
    useApproveUserMutation,
    useRejectUserMutation,
    useResetPasswordMutation,
    useUpdateUserMutation,
} from '../features/users/usersApiSlice'
import { Plus, UserX, UserCheck, Shield, Key, Loader, Mail, Phone, ChevronLeft, Edit, Store, User as UserIcon, Ban, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { useToast } from '../components/ToastContext'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { useNavigate } from 'react-router-dom'

import PageShimmer from '../components/PageShimmer'

const StaffList = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('active') // 'active', 'pending', 'all'
    const { data, isLoading, error, refetch } = useGetUsersQuery({
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined
    })
    const [toggleBlockStatus] = useToggleBlockStatusMutation()
    const [approveUser] = useApproveUserMutation()
    const [rejectUser] = useRejectUserMutation()
    const [resetPassword] = useResetPasswordMutation()
    const [updateUser] = useUpdateUserMutation()
    const { showToast } = useToast()

    const users = data?.users || []
    const total = data?.total || 0
    const pages = data?.pages || 0

    // State for Password Reset Modal
    const [resetModalOpen, setResetModalOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)
    const [newPassword, setNewPassword] = useState('')

    // State for Edit User Modal
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        username: '',
        email: '',
        mobileNumber: '',
        role: '',
        shopName: ''
    })

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
        } catch (err) {
            showToast({ message: 'Failed to update status: ' + (err.data?.message || err.message), type: 'error' })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleApprove = async (id) => {
        setUpdatingId(id)
        try {
            await approveUser(id).unwrap()
            showToast({ message: 'User approved successfully and welcome email sent', type: 'success' })
        } catch (err) {
            showToast({ message: 'Failed to approve user: ' + (err.data?.message || err.message), type: 'error' })
        } finally {
            setUpdatingId(null)
        }
    }

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject and PERMANENTLY delete this registration request?')) return;

        setUpdatingId(id)
        try {
            await rejectUser(id).unwrap()
            showToast({ message: 'User registration rejected and deleted', type: 'success' })
        } catch (err) {
            showToast({ message: 'Failed to reject user: ' + (err.data?.message || err.message), type: 'error' })
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

    const openEditModal = (user) => {
        setSelectedUser(user)
        setEditForm({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            mobileNumber: user.mobileNumber || '',
            role: user.role || '',
            shopName: user.shopName || ''
        })
        setEditModalOpen(true)
    }

    const handleUpdateUser = async () => {
        try {
            await updateUser({ id: selectedUser._id, ...editForm }).unwrap()
            showToast({ message: 'User updated successfully', type: 'success' })
            setEditModalOpen(false)
        } catch (err) {
            showToast({ message: 'Failed to update user: ' + (err.data?.message || err.message), type: 'error' })
        }
    }

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700'
            case 'staff': return 'bg-blue-100 text-blue-700'
            case 'vle': return 'bg-amber-100 text-amber-700'
            case 'akshaya': return 'bg-emerald-100 text-emerald-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (isLoading) return <PageShimmer variant="list" />
    if (error) return <div className="text-center text-red-500 mt-10">Error loading users data</div>

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
                        <h1 className="text-3xl font-black text-gray-900 leading-none">User Management</h1>
                        <p className="text-gray-500 text-sm font-medium mt-1">Manage staff and VLE operators</p>
                    </div>
                </div>
                <Link
                    to="/admin/add-staff"
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/10 active:scale-95 font-bold w-full sm:w-auto"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Staff
                </Link>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
                    <button
                        onClick={() => { setStatusFilter('active'); setPage(1); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Active Members
                    </button>
                    <button
                        onClick={() => { setStatusFilter('pending'); setPage(1); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'pending' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        Pending Approval
                    </button>
                    <button
                        onClick={() => { setStatusFilter('all'); setPage(1); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-gray-800 text-white shadow-lg shadow-gray-800/20' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                </div>
                <div className="text-sm text-gray-600 font-bold bg-gray-50 inline-block px-4 py-2 rounded-full border border-gray-100">
                    {total} {statusFilter.toUpperCase()} MEMBERS
                </div>
            </div>

            {/* Mobile View: Card Layout */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {users?.map((user) => (
                    <div key={user._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRoleBadgeClass(user.role)}`}>
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-black text-gray-900">{user.username}</div>
                                    <div className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-purple-500' : 'text-blue-500'}`}>
                                        {user.role}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${user.isActive && user.isApproved ? 'bg-green-50 text-green-700 border-green-100' :
                                (!user.isApproved && user.isEmailVerified) ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                    !user.isActive ? 'bg-red-50 text-red-700 border-red-100' : 'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                {user.isActive && user.isApproved ? 'Active' : (!user.isApproved && user.isEmailVerified) ? 'Pending Approval' : !user.isActive ? 'Blocked' : 'Unverified'}
                            </span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-bold">
                                <Phone size={14} className="text-gray-400" />
                                {user.mobileNumber || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                                <Shield size={14} className="text-gray-400" />
                                Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                            </div>
                            {user.shopName && (
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium italic pt-1 border-t border-gray-100">
                                    <Store size={14} className="text-gray-400" />
                                    {user.shopName}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {user.role !== 'admin' && (
                                <>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-black text-xs hover:bg-gray-100 transition-all active:scale-95"
                                    >
                                        <Edit size={16} />
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => openResetModal(user)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-all active:scale-95"
                                    >
                                        <Key size={16} />
                                        KEY
                                    </button>
                                    <button
                                        onClick={() => handleBlockToggle(user._id, user.isActive)}
                                        disabled={updatingId === user._id || !user.isApproved}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 ${!user.isApproved ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : user.isActive ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                                    >
                                        {updatingId === user._id ? (
                                            <Loader className="animate-spin" size={16} />
                                        ) : (
                                            <>
                                                {user.isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                {user.isActive ? 'BAN' : 'UNBAN'}
                                            </>
                                        )}
                                    </button>
                                    {!user.isApproved && user.isEmailVerified && (
                                        <div className="w-full flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleApprove(user._id)}
                                                disabled={updatingId === user._id}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/20"
                                            >
                                                {updatingId === user._id ? <Loader className="animate-spin" size={16} /> : <><CheckCircle size={16} /> APPROVE</>}
                                            </button>
                                            <button
                                                onClick={() => handleReject(user._id)}
                                                disabled={updatingId === user._id}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-600/20"
                                            >
                                                {updatingId === user._id ? <Loader className="animate-spin" size={16} /> : <><XCircle size={16} /> REJECT</>}
                                            </button>
                                        </div>
                                    )}
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
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">User / Shop</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Contact & Activity</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {users?.map((user) => (
                            <tr key={user._id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${getRoleBadgeClass(user.role)}`}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{user.name || user.username}</div>
                                            {user.shopName && <div className="text-[10px] text-gray-400 font-medium">{user.shopName}</div>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600 font-bold">{user.email || '-'}</div>
                                    <div className="text-[11px] text-gray-400 font-medium italic">
                                        Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                        <Phone size={10} /> {user.mobileNumber}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-[10px] leading-5 font-black uppercase rounded-full border ${getRoleBadgeClass(user.role)} border-current/20`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${user.isActive && user.isApproved ? 'bg-green-500' : (!user.isApproved && user.isEmailVerified) ? 'bg-orange-500' : !user.isActive ? 'bg-red-500' : 'bg-gray-300'}`} />
                                        <span className={`text-xs font-bold ${user.isActive && user.isApproved ? 'text-green-700' : (!user.isApproved && user.isEmailVerified) ? 'text-orange-700' : !user.isActive ? 'text-red-700' : 'text-gray-500'}`}>
                                            {user.isActive && user.isApproved ? 'Active' : (!user.isApproved && user.isEmailVerified) ? 'Pending Approval' : !user.isActive ? 'Blocked' : 'Unverified'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                                    {user.role !== 'admin' && (
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                                                title="Edit User"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openResetModal(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Reset Password"
                                            >
                                                <Key size={18} />
                                            </button>
                                            {!user.isApproved && user.isEmailVerified && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(user._id)}
                                                        disabled={updatingId === user._id}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Approve User"
                                                    >
                                                        {updatingId === user._id ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(user._id)}
                                                        disabled={updatingId === user._id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reject User"
                                                    >
                                                        {updatingId === user._id ? <Loader className="animate-spin" size={18} /> : <XCircle size={18} />}
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleBlockToggle(user._id, user.isActive)}
                                                disabled={updatingId === user._id || !user.isApproved}
                                                className={`p-2 rounded-lg transition-all ${!user.isApproved ? 'text-gray-300 cursor-not-allowed' : user.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={user.isActive ? 'Ban User' : 'Unban User'}
                                            >
                                                {updatingId === user._id ? (
                                                    <Loader className="animate-spin" size={18} />
                                                ) : (
                                                    user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />
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

            {/* Edit User Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditModalOpen(false)} />
                    <div className="relative bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 h-fit max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <Edit size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Edit User</h3>
                                <p className="text-xs text-gray-500">Update account information</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Role</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="vle">VLE</option>
                                        <option value="akshaya">Akshaya</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                                <input
                                    type="text"
                                    value={editForm.mobileNumber}
                                    onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm"
                                />
                            </div>

                            {(editForm.role === 'vle' || editForm.role === 'akshaya') && (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Shop / Centre Name</label>
                                    <input
                                        type="text"
                                        value={editForm.shopName}
                                        onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm border-blue-200"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="flex-1 py-3 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="flex-2 px-8 py-3 bg-blue-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
