import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'
import ProfileDrawer from './ProfileDrawer'

const Layout = () => {
    const [isProfileOpen, setIsProfileOpen] = React.useState(false)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="hidden md:block">
                <Navbar />
            </div>

            <main className="flex-grow pb-24 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>

            <footer className="hidden md:block bg-white border-t border-gray-100 mt-auto">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">N</span>
                                </div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent font-poppins">Notify CSC</h3>
                            </div>
                            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                                Professional insurance renewal tracking and management for CSC Administrators.
                            </p>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Our Office</h4>
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-gray-900">Common Service Centre</p>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Ammaveedu JN, Near Main Road<br />
                                    Kerala, India
                                </p>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="space-y-4 md:text-right">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 md:justify-end">Connect</h4>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-blue-600 font-mono tracking-tight">9633565414</p>
                                <p className="text-lg font-black text-blue-600 font-mono tracking-tight">9539791670</p>
                            </div>
                            <p className="text-xs text-gray-400">Available Mon-Sat: 9AM - 6PM</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs font-medium text-gray-400">
                            &copy; {new Date().getFullYear()} Notify CSC. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
                        </div>
                    </div>
                </div>
            </footer>

            <MobileBottomNav onProfileClick={() => setIsProfileOpen(true)} />

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    )
}

export default Layout
