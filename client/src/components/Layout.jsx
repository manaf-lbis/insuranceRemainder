import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import MobileBottomNav from './MobileBottomNav'

const Layout = () => {
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

            <footer className="hidden md:block bg-white border-t py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} CSC Insurance Tracker. All rights reserved.
                </div>
            </footer>

            <MobileBottomNav />
        </div>
    )
}

export default Layout
