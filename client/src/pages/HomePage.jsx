import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import AnnouncementsSection from '../components/AnnouncementsSection';
import NewsTicker from '../components/NewsTicker';
import QuickLinks from '../components/QuickLinks';
import PremiumHero from '../components/PremiumHero';



const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <header className="bg-blue-900 shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="bg-white/10 p-1.5 rounded-lg">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white font-poppins tracking-wide">
                            Notify CSC
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link
                            to="/news"
                            className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
                        >
                            Latest News
                        </Link>
                        <Link
                            to="/services"
                            className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-4 py-2 hover:bg-white/10 rounded-lg"
                        >
                            Our Services
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* News Ticker */}
                <NewsTicker />

                {/* Premium Hero Section */}
                <PremiumHero />

                {/* Quick Links Section */}
                <QuickLinks />

                {/* Announcements Section (Text Only) */}
                <AnnouncementsSection limit={4} />
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
