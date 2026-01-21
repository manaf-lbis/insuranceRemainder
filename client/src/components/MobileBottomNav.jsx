import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, User, PlusCircle } from 'lucide-react'

const MobileBottomNav = ({ onProfileClick }) => {
    const location = useLocation()
    const isActive = (path) => location.pathname === path

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
        { path: '/insurances', label: 'Records', icon: List },
        { type: 'button', onClick: onProfileClick, label: 'Profile', icon: User, activeIf: (path) => false },
    ]

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 z-40 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center pb-2">
                {navItems.map((item, idx) => (
                    item.type === 'button' ? (
                        <button
                            key={idx}
                            onClick={item.onClick}
                            className="flex flex-col items-center justify-center w-16 py-1 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <item.icon size={24} strokeWidth={2} className="mb-1" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${isActive(item.path)
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <item.icon
                                size={24}
                                strokeWidth={isActive(item.path) ? 2.5 : 2}
                                className={`mb-1 transition-transform ${isActive(item.path) ? 'scale-110' : ''}`}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    )
                ))}
            </div>
        </div>
    )
}

export default MobileBottomNav
