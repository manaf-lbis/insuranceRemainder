import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AnnouncementsSection from '../components/AnnouncementsSection';
import NewsTicker from '../components/NewsTicker';
import QuickLinks from '../components/QuickLinks';
import PremiumHero from '../components/PremiumHero';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar variant="solid" />
            <NewsTicker top="top-[64px]" />

            <main className="flex-grow md:pt-0">

                {/* Premium Hero Section */}
                <PremiumHero />

                {/* Quick Links Section */}
                <QuickLinks />

                {/* Announcements Section (Text Only) */}
                <AnnouncementsSection limit={10} />
            </main>

            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm mb-3">&copy; {new Date().getFullYear()} Notify CSC. Serving you with trust.</p>
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        Admin Login
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
