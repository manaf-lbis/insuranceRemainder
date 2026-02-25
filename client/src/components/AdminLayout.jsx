import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../features/auth/authSlice';
import { useGetAdminBadgesQuery } from '../features/users/usersApiSlice';
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
    Shield,
    BarChart3,
    Folder
} from 'lucide-react';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { data: badges } = useGetAdminBadgesQuery(undefined, {
        pollingInterval: 30000, // Poll every 30 seconds for badges
        skip: user?.role !== 'admin'
    });

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/login');
    };

    const navItems = [
        {
            group: 'Management',
            items: [
                { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff'] },
                { path: '/insurances', label: 'Insurance Records', icon: FileText, roles: ['admin', 'staff'] },
                { path: '/admin/documents', label: 'Document Library', icon: Folder, roles: ['admin'] },
            ]
        },
        {
            group: 'Design & Media',
            items: [
                { path: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'staff'] },
                { path: '/admin/posters', label: 'Hero Engine', icon: ImageIcon, roles: ['admin', 'staff'] },
                { path: '/admin/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin', 'staff'] },
            ]
        },
        {
            group: 'System',
            items: [
                { path: '/admin/staff', label: 'Staff & Roles', icon: Users, roles: ['admin'], badge: badges?.pendingUsers },
                { path: '/admin/support', label: 'Issue Management', icon: Shield, roles: ['admin'], badge: badges?.pendingIssues },
            ]
        }
    ];

    const filterItems = (items) => items.filter(item =>
        !item.roles || item.roles.includes(user?.role || 'staff')
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
                    }`}
            >
                {/* Brand Area */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/50">
                    <Link to="/" className="flex items-center gap-3 font-black text-xl tracking-tighter text-white">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="text-white" size={18} />
                        </div>
                        <span className="font-poppins">NOTIFY</span>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* User Context */}
                <div className="p-6">
                    <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center font-black text-lg shadow-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate">{user?.username}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grouped Navigation */}
                <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto custom-scrollbar">
                    {navItems.map((group, gIdx) => {
                        const items = filterItems(group.items);
                        if (items.length === 0) return null;

                        return (
                            <div key={gIdx} className="space-y-2">
                                <h3 className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    {group.group}
                                </h3>
                                <div className="space-y-1">
                                    {items.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={({ isActive }) => `
                                                flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200
                                                ${isActive
                                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                                                    <span className="flex-1">{item.label}</span>
                                                    {item.badge > 0 && (
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center w-full gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest text-rose-400 transition-all bg-rose-500/5 rounded-xl border border-rose-500/10 hover:bg-rose-500 hover:text-white"
                    >
                        <LogOut size={16} />
                        Terminate Session
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
