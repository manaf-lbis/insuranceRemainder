import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logOut } from '../features/auth/authSlice'
import { LayoutDashboard, FolderOpen, Upload, LogOut, Menu, X, ShieldCheck, MessageSquare } from 'lucide-react'
import './VleLayout.css' // Kept for any leftover globals, though it is now empty

const VleLayout = ({ children }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        dispatch(logOut())
        navigate('/vle/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/vle/dashboard', icon: LayoutDashboard },
        { name: 'Library', href: '/vle/documents', icon: FolderOpen },
        { name: 'Contributions', href: '/vle/contributions', icon: Upload },
        { name: 'Support Tickets', href: '/vle/support', icon: MessageSquare },
    ]

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Brand */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 justify-between lg:justify-start">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 relative">
                            <img src="/appIcon.jpg" alt="Logo" className="h-6 w-6 rounded object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                            <ShieldCheck className="h-5 w-5 text-primary absolute" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">Notify CSC</h1>
                            <p className="text-xs text-slate-400 font-medium tracking-wide text-primary">OPERATOR PORTAL</p>
                        </div>
                    </div>
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                }
                            `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || user?.username}</p>
                            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                                {user?.role === 'akshaya' ? '🏛️ Akshaya' : '🌐 VLE'} Operator
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 hover:text-red-300 transition-colors border border-red-400/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Operator Portal
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default VleLayout
