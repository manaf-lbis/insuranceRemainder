import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logOut } from '../features/auth/authSlice'
import { useUpdateUserProfileMutation } from '../features/users/usersApiSlice'
import {
    X,
    LogOut,
    Users,
    Key,
    User as UserIcon,
    ChevronRight,
    ShieldCheck,
    AtSign
} from 'lucide-react'

const ProfileDrawer = ({ isOpen, onClose }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [pwdModalOpen, setPwdModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()

    if (!isOpen && !pwdModalOpen) return null

    const handleLogout = () => {
        dispatch(logOut())
        onClose()
        navigate('/login')
    }

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters')
            return
        }
        try {
            await updateProfile({ password: newPassword }).unwrap()
            alert('Password updated successfully')
            setPwdModalOpen(false)
            setNewPassword('')
            onClose()
        } catch (err) {
            alert('Failed to update password: ' + (err.data?.message || err.message))
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[70] transition-transform duration-300 ease-out md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.12)] max-h-[90vh] overflow-y-auto ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="px-6 pb-8">
                    {/* Header: User Info */}
                    <div className="flex items-center gap-4 py-6 mb-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-200">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.username || 'Admin User'}</h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user?.role || 'Staff'}
                                </span>
                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                    <ShieldCheck size={12} />
                                    Verified
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-50 text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Action List */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] ml-1 mb-3">Account Settings</p>

                        <div className="bg-gray-50/50 rounded-2xl p-1">
                            {/* Profile Info Item */}
                            <div className="flex items-center gap-3 p-4">
                                <div className="p-2 rounded-xl bg-white shadow-sm text-blue-600 border border-gray-100">
                                    <AtSign size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 font-medium">Username</p>
                                    <p className="text-sm font-semibold text-gray-700">{user?.username}</p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 mx-4" />

                            {/* Change Password Button */}
                            <button
                                onClick={() => setPwdModalOpen(true)}
                                className="w-full flex items-center gap-3 p-4 hover:bg-white transition-colors duration-200"
                            >
                                <div className="p-2 rounded-xl bg-white shadow-sm text-amber-500 border border-gray-100">
                                    <Key size={20} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-semibold text-gray-700">Security</p>
                                    <p className="text-xs text-gray-400">Update your account password</p>
                                </div>
                                <ChevronRight size={18} className="text-gray-300" />
                            </button>
                        </div>

                        {/* Admin Sections */}
                        {user?.role === 'admin' && (
                            <div className="mt-6">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px] ml-1 mb-3">Admin Controls</p>
                                <Link
                                    to="/admin/staff"
                                    onClick={onClose}
                                    className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100"
                                >
                                    <div className="p-2 rounded-xl bg-white shadow-sm text-purple-600 border border-purple-100">
                                        <Users size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-purple-900">User Management</p>
                                        <p className="text-xs text-purple-600/70">Manage staff and permissions</p>
                                    </div>
                                    <ChevronRight size={18} className="text-purple-300" />
                                </Link>
                            </div>
                        )}

                        {/* Danger Zone */}
                        <div className="mt-8">
                            <button
                                onClick={handleLogout}
                                className="w-full h-14 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reuse Change Password Modal specifically for mobile if needed, 
                but we'll implement it inline or as a separate layer here */}
            {pwdModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-2 text-gray-800">Change Password</h3>
                        <p className="text-sm text-gray-500 mb-6">Enter a new secure password.</p>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPwdModalOpen(false)}
                                className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isUpdating}
                                className="flex-2 h-12 bg-blue-600 text-white px-6 font-bold rounded-xl disabled:bg-gray-400"
                            >
                                {isUpdating ? 'Updating...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProfileDrawer
