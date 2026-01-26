import React, { useState, useMemo } from 'react';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { useGetNewsCategoriesQuery } from '../features/announcements/newsCategoriesApiSlice';
import { Calendar, ArrowRight, Clock, Tag, Filter } from 'lucide-react'; // Imports
import { Link } from 'react-router-dom';
import { extractFirstImage } from '../utils/stringUtils';
import Navbar from '../components/Navbar';
import NewsShimmer from '../components/NewsShimmer'; // Import Shimmer

// Helper for time ago - made reusable if needed, but keeping local for now
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hr ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return Math.floor(seconds) + " sec ago";
};

const NewsCard = ({ announcement, featured = false }) => {
    const firstImage = extractFirstImage(announcement.content);

    if (featured) {
        return (
            <Link to={`/announcements/${announcement._id}`} className="group relative block w-full overflow-hidden rounded-[40px] bg-white shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />

                {/* Image */}
                <div className="h-[400px] md:h-[500px] w-full overflow-hidden bg-slate-200">
                    {firstImage ? (
                        <img
                            src={firstImage}
                            alt={announcement.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            📰
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20">
                            Featured
                        </span>
                        <span className="flex items-center gap-1 text-slate-300 text-xs font-bold uppercase tracking-wider">
                            <Clock size={12} /> {timeAgo(announcement.createdAt)}
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white font-poppins leading-tight mb-4 drop-shadow-md line-clamp-2 md:line-clamp-3">
                        {announcement.title}
                    </h2>
                    <div className="flex items-center gap-2 text-white/80 font-medium text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        Read Full Story <ArrowRight size={16} />
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link to={`/announcements/${announcement._id}`} className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 h-full transform hover:-translate-y-1">
            {/* Image Section */}
            <div className="h-56 overflow-hidden relative bg-slate-50">
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                {firstImage ? (
                    <img
                        src={firstImage}
                        alt={announcement.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-blue-50 text-blue-200">
                        📢
                    </div>
                )}
                <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {announcement.category?.name || 'CSC Info'}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col relative">
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                        <Tag size={12} className="text-blue-500" />
                        <span>{announcement.category?.name || 'News'}</span>
                        <span>•</span>
                        <span>{timeAgo(announcement.createdAt)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-poppins line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {announcement.title}
                    </h3>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500 transition-colors">Read Article</span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    );
};

const NewsPage = () => {
    const { data: announcements, isLoading, error } = useGetPublicAnnouncementsQuery();
    const { data: categories } = useGetNewsCategoriesQuery();
    const [visibleCount, setVisibleCount] = useState(7); // Start with 7 (1 hero + 6 grid)
    const [selectedCategory, setSelectedCategory] = useState('All');

    const processedAnnouncements = useMemo(() => {
        if (!announcements) return [];

        const now = new Date();
        const active = [...announcements]
            .filter(a => !a.expiresAt || new Date(a.expiresAt) > now);

        // Filter by Category
        const filtered = selectedCategory === 'All'
            ? active
            : active.filter(a => a.category?._id === selectedCategory);

        return filtered.sort((a, b) => {
            // Priority Sort: Hot first
            if (a.priority === 'hot' && b.priority !== 'hot') return -1;
            if (a.priority !== 'hot' && b.priority === 'hot') return 1;

            // Then Date Sort
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [announcements, selectedCategory]);

    // Handle Loading with Shimmer
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50/50">
                <Navbar variant="solid" />
                <div className="pt-24 pb-20">
                    <NewsShimmer />
                </div>
            </div>
        );
    }

    // Handle Error
    if (error) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col">
                <Navbar variant="solid" />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] p-8 md:p-12 text-center shadow-xl shadow-rose-900/5 border border-rose-100 max-w-lg w-full">
                        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-6 text-2xl">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-poppins">Connection Error</h2>
                        <p className="text-slate-500 mb-8">Unable to fetch the latest news from the registry. Please check your internet connection.</p>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const heroItem = processedAnnouncements.length > 0 ? processedAnnouncements[0] : null;
    const gridItems = processedAnnouncements.slice(1, visibleCount);

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <Navbar variant="solid" />

            <main className="flex-grow pt-24 pb-20">
                {/* Header */}
                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-poppins tracking-tight mb-4 leading-tight">
                        News & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">Insights</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mb-8">
                        Stay ahead with the latest announcements, policy changes, and updates from the digital world.
                    </p>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'All'
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            All Stories
                        </button>
                        {categories?.map((cat) => (
                            <button
                                key={cat._id}
                                onClick={() => setSelectedCategory(cat._id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat._id
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {processedAnnouncements.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 shadow-sm animate-fade-in-up">
                            <div className="text-5xl mb-6">📭</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No News Found</h3>
                            <p className="text-slate-500">
                                {selectedCategory === 'All' ? "We're waiting for the latest updates." : "No updates found in this category."}
                            </p>
                            {selectedCategory !== 'All' && (
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                                >
                                    View All News
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Hero Section - Show only if "All" is selected OR if it's the first result of filtered search (optional choice, showing hero for filter too is good) */}
                            {heroItem && (
                                <div className="mb-16 animate-fade-in-up">
                                    <NewsCard announcement={heroItem} featured={true} />
                                </div>
                            )}

                            {/* Grid Section */}
                            {gridItems.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                                    {gridItems.map((announcement, idx) => (
                                        <div key={announcement._id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <NewsCard announcement={announcement} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Load More */}
                            {visibleCount < processedAnnouncements.length && (
                                <div className="text-center pt-8 border-t border-slate-200/60">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="group px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-lg shadow-slate-200/50 flex items-center gap-2 mx-auto"
                                    >
                                        <span>Load More Articles</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest opacity-50">&copy; {new Date().getFullYear()} Notify CSC • Built for Excellence</p>
                </div>
            </footer>
        </div>
    );
};

export default NewsPage;
