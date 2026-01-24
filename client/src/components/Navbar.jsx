import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../features/auth/authSlice'
import { useUpdateUserProfileMutation } from '../features/users/usersApiSlice'
import { Menu, X, Shield, PlusCircle, List, LayoutDashboard, LogOut, Users, Key, Image as ImageIcon } from 'lucide-react'

const Navbar = () => {
    const dispatch = useDispatch()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [isOpen, setIsOpen] = useState(false)

    // Change Password State
    const [pwdModalOpen, setPwdModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation()

    const toggleMenu = () => setIsOpen(!isOpen)

    // Helper to determine if link is active
    const isActive = (path) => location.pathname === path

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
        } catch (err) {
            alert('Failed to update password: ' + (err.data?.message || err.message))
        }
    }

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/add-insurance', label: 'Add Insurance', icon: PlusCircle },
        { path: '/insurances', label: 'View Records', icon: List },
    ]

    return (
        <nav className="bg-blue-900/95 backdrop-blur-md border-b border-blue-800 shadow-xl shadow-blue-900/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center">
                        <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img
                                    src="/appIcon.jpg"
                                    alt="Notify CSC Logo"
                                    className="relative h-9 w-9 md:h-10 md:w-10 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <span className="text-white font-bold text-lg tracking-wide font-poppins text-shadow-sm">Notify CSC</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive(link.path)
                                            ? 'bg-blue-700/80 text-white shadow-inner shadow-blue-900/50 border border-blue-600/50'
                                            : 'text-blue-100 hover:bg-blue-800/50 hover:text-white hover:shadow-sm'
                                            }`}
                                    >
                                        <link.icon className={`w-4 h-4 mr-2 ${isActive(link.path) ? 'text-blue-200' : 'text-blue-300'}`} />
                                        {link.label}
                                    </Link>
                                ))}

                                {/* Admin Only Link */}
                                {user?.role === 'admin' && (
                                    <>
                                        <Link
                                            to="/admin/staff"
                                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive('/admin/staff')
                                                ? 'bg-purple-800/80 text-white shadow-inner shadow-purple-900/50 border border-purple-600/50'
                                                : 'text-blue-100 hover:bg-purple-800/50 hover:text-white hover:shadow-sm'
                                                }`}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Users
                                        </Link>
                                        <Link
                                            to="/admin/posters"
                                            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive('/admin/posters')
                                                ? 'bg-purple-800/80 text-white shadow-inner shadow-purple-900/50 border border-purple-600/50'
                                                : 'text-blue-100 hover:bg-purple-800/50 hover:text-white hover:shadow-sm'
                                                }`}
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Posters
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Profile & Logout (Desktop) */}
                    <div className="hidden md:block">
                        <div className="flex items-center ml-4 space-x-4">
                            <span className="text-blue-200 text-sm">
                                Welcome, <span className="font-semibold text-white">{user?.username || 'User'}</span>
                            </span>
                            <button
                                onClick={() => setPwdModalOpen(true)}
                                className="text-blue-200 hover:text-white transition-colors"
                                title="Change Password"
                            >
                                <Key className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(logOut())
                                    navigate('/login')
                                }}
                                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-blue-900 border-t border-blue-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium block ${isActive(link.path)
                                    ? 'bg-blue-800 text-white'
                                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.label}
                            </Link>
                        ))}

                        {/* Admin Only Link Mobile */}
                        {user?.role === 'admin' && (
                            <>
                                <Link
                                    to="/admin/staff"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium block ${isActive('/admin/staff')
                                        ? 'bg-purple-800 text-white'
                                        : 'text-blue-100 hover:bg-purple-700 hover:text-white'
                                        }`}
                                >
                                    <Users className="w-5 h-5 mr-3" />
                                    Users
                                </Link>
                                <Link
                                    to="/admin/posters"
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium block ${isActive('/admin/posters')
                                        ? 'bg-purple-800 text-white'
                                        : 'text-blue-100 hover:bg-purple-700 hover:text-white'
                                        }`}
                                >
                                    <ImageIcon className="w-5 h-5 mr-3" />
                                    Posters
                                </Link>
                            </>
                        )}
                    </div>
                    <div className="pt-4 pb-4 border-t border-blue-800">
                        <div className="flex items-center px-5 mb-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
                                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium leading-none text-white">
                                    {user?.username || 'User'}
                                </div>
                                <div className="text-sm font-medium leading-none text-blue-300 mt-1">
                                    {user?.role || 'Staff'}
                                </div>
                            </div>
                        </div>
                        <div className="px-2 space-y-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false)
                                    setPwdModalOpen(true)
                                }}
                                className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-800 transition-colors"
                            >
                                <Key className="w-5 h-5 mr-2" />
                                Change Password
                            </button>
                            <button
                                onClick={() => {
                                    dispatch(logOut())
                                    setIsOpen(false)
                                    navigate('/login')
                                }}
                                className="w-full flex items-center justify-center px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {pwdModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
                        <button
                            onClick={() => setPwdModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Change Your Password</h3>
                        <p className="text-sm text-gray-500 mb-4">Enter a new secure password.</p>

                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password"
                            className="w-full px-3 py-2 border rounded-md mb-6 focus:ring-blue-500 focus:border-blue-500"
                        />

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setPwdModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {isUpdating ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
