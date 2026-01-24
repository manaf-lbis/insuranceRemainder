import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../features/auth/authSlice';
import {
    LayoutDashboard,
    Users,
    Image as ImageIcon,
    Megaphone,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
        { path: '/insurances', label: 'Insurance Records', icon: FileText, roles: ['admin', 'staff'] },
        { path: '/admin/posters', label: 'Posters', icon: ImageIcon, roles: ['admin'] },
        { path: '/admin/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin'] },
        { path: '/admin/staff', label: 'Staff & Users', icon: Users, roles: ['admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.roles || item.roles.includes(user?.role || 'staff')
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Brand */}
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950/50">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide text-white/90 hover:text-white transition-colors">
                        <Shield className="text-emerald-400" size={24} />
                        <span className="font-poppins">Notify CSC</span>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* User Profile Summary (Sidebar) */}
                <div className="px-6 py-6 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                            {user?.username?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Management
                    </p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)} // Close on mobile on click
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                            `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-red-400 transition-colors bg-red-500/10 rounded-lg hover:bg-red-500/20 hover:text-red-300"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top Header (Mobile & Context) */}
                <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 lg:hidden">
                    <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-700">
                        <Menu size={24} />
                    </button>
                    <span className="font-semibold text-slate-800">Admin Panel</span>
                    <div className="w-6"></div> {/* Spacer for balance */}
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
