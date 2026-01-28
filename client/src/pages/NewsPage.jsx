import React, { useState, useMemo } from 'react';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { useGetNewsCategoriesQuery } from '../features/announcements/newsCategoriesApiSlice';
import { ArrowRight } from 'lucide-react';
import { AnnouncementCard } from '../components/AnnouncementsSection';
import Navbar from '../components/Navbar';
import NewsShimmer from '../components/NewsShimmer';

const NewsPage = () => {
    const { data: announcements, isLoading, error } = useGetPublicAnnouncementsQuery();
    const { data: categories } = useGetNewsCategoriesQuery();
    const [visibleCount, setVisibleCount] = useState(12); // Start with more items for grid
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
                <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

    const gridItems = processedAnnouncements.slice(0, visibleCount);

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
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-poppins tracking-tight mb-4 leading-tight">
                        News & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">Insights</span>
                    </h1>
                    <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed mb-8">
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
                        <div className="bg-white rounded-[24px] p-12 text-center border border-slate-100 shadow-sm animate-fade-in-up">
                            <div className="text-4xl mb-4">📭</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No News Found</h3>
                            <p className="text-slate-500 text-sm">
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
                            {/* Grid Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {gridItems.map((announcement, idx) => (
                                    <div key={announcement._id} className="animate-fade-in-up h-full" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <AnnouncementCard announcement={announcement} />
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            {visibleCount < processedAnnouncements.length && (
                                <div className="text-center pt-8 border-t border-slate-200/60">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="group px-8 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto text-sm"
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


