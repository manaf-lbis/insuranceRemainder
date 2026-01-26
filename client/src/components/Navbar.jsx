import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../features/auth/authSlice';
import {
    Menu, X, Shield, LayoutDashboard, LogOut,
    Newspaper, Briefcase, Info, Home, ChevronDown, User, Key
} from 'lucide-react';
import { useUpdateUserProfileMutation } from '../features/users/usersApiSlice';

const Navbar = ({ variant = 'solid' }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    // Change Password State
    const [pwdModalOpen, setPwdModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
    const navRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
                setUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/news', label: 'Latest News', icon: Newspaper },
        { path: '/services', label: 'Our Services', icon: Briefcase },
        { path: '/about', label: 'About Us', icon: Info },
    ];

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/login');
    };

    const isSolid = variant === 'solid' || scrolled;

    const handleChangePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        try {
            await updateProfile({ password: newPassword }).unwrap();
            alert('Password updated successfully');
            setPwdModalOpen(false);
            setNewPassword('');
        } catch (err) {
            alert('Failed to update password: ' + (err.data?.message || err.message));
        }
    };

    return (
        <nav ref={navRef} className={`sticky top-0 left-0 right-0 z-[60] transition-all duration-300 ${isSolid
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3 shadow-sm'
            : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">

                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className={`p-1.5 rounded-xl transition-all duration-300 ${isSolid ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white/10 backdrop-blur-md'}`}>
                            <Shield className={`${isSolid ? 'text-white' : 'text-blue-400'} w-6 h-6`} />
                        </div>
                        <span className={`text-xl font-black tracking-tighter font-poppins transition-colors ${isSolid ? 'text-slate-900' : 'text-white'}`}>
                            NOTIFY<span className="text-blue-500">CSC</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-colors ${isSolid ? 'bg-slate-100 border-slate-200' : 'bg-slate-100/10 border-white/10 backdrop-blur-md'}`}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive(link.path)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : isSolid ? 'text-slate-500 hover:text-slate-900' : 'text-white hover:text-blue-200'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isSolid
                                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                                        : 'bg-white/10 border-white/20 text-white backdrop-blur-md'
                                        }`}
                                >
                                    <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-[10px] font-black text-white uppercase">
                                        {user.username.charAt(0)}
                                    </div>
                                    <span className="text-sm font-black">{user.username}</span>
                                    <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                                            <LayoutDashboard size={18} className="text-blue-500" />
                                            Admin Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setPwdModalOpen(true);
                                                setUserMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            <Key size={18} className="text-slate-400" />
                                            Change Password
                                        </button>
                                        <div className="my-2 border-t border-slate-50"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={`px-6 h-10 rounded-full text-sm font-black flex items-center transition-all ${scrolled
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700'
                                    : 'bg-white text-slate-900 hover:bg-blue-50'
                                    }`}
                            >
                                START SESSION
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`md:hidden p-2 rounded-xl transition-all ${isSolid ? 'text-slate-900 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="p-6 space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all ${isActive(link.path)
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </Link>
                        ))}

                        <div className="pt-4 border-t border-slate-50">
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white font-bold"
                                >
                                    <LayoutDashboard size={20} />
                                    Admin Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-center p-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/30"
                                >
                                    Start Session
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {pwdModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <button
                            onClick={() => setPwdModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-all"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-900 font-poppins tracking-tight">Security Update</h3>
                            <p className="text-slate-500 text-sm mt-1 font-medium italic underline decoration-blue-500/20 underline-offset-4">Change your account password below</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Key size={12} className="text-blue-500" />
                                    New Access Key
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter secure password..."
                                    className="w-full bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-bold text-slate-800"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPwdModalOpen(false)}
                                    className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isUpdating}
                                    className="flex-[2] py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    {isUpdating ? 'Updating Registry...' : 'Update Key'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
