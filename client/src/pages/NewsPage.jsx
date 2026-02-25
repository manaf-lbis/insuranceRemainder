import React, { useState, useMemo } from 'react';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { useGetNewsCategoriesQuery } from '../features/announcements/newsCategoriesApiSlice';
import { Sparkles, Filter, ChevronRight } from 'lucide-react';
import { AnnouncementCard } from '../components/AnnouncementsSection';
import Navbar from '../components/Navbar';
import NewsShimmer from '../components/NewsShimmer';

const NewsPage = () => {
    const { data: announcements, isLoading, error } = useGetPublicAnnouncementsQuery();
    const { data: categories } = useGetNewsCategoriesQuery();
    const [visibleCount, setVisibleCount] = useState(12);
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
            if (a.priority === 'hot' && b.priority !== 'hot') return -1;
            if (a.priority !== 'hot' && b.priority === 'hot') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [announcements, selectedCategory]);

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

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex flex-col">
                <Navbar variant="solid" />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-12 text-center shadow-2xl shadow-rose-900/5 border border-rose-100 max-w-lg w-full">
                        <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-6 text-3xl">
                            ⚠️
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-poppins tracking-tight">System Offline</h2>
                        <p className="text-slate-500 mb-8 font-medium">We're having trouble reaching the news servers. Please try again in a moment.</p>
                        <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10">
                            Retry Connection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const gridItems = processedAnnouncements.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
            <Navbar variant="solid" />

            <main className="flex-grow pt-28 pb-20">
                {/* Dynamic Header */}
                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-4 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-blue-50 border border-blue-100/50">
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">The News Registry</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-poppins tracking-tight leading-[0.9]">
                                Verified Updates <span className="text-blue-600">&</span> Insights.
                            </h1>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                Stay informed with direct announcements from Notify CSC's institutional registry.
                            </p>
                        </div>

                        {/* Stats Summary */}
                        <div className="hidden lg:flex items-center gap-6 p-1 bg-white border border-slate-100 rounded-3xl pr-6 shadow-sm">
                            <div className="bg-slate-900 text-white p-4 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Total News</p>
                                <p className="text-2xl font-black">{processedAnnouncements.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Now Serving</p>
                                <p className="text-sm font-bold text-slate-700">Real-time Public Feed</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Filter Bar */}
                    <div className="mb-10 flex flex-col sm:flex-row items-center gap-4 border-b border-slate-200/60 pb-8">
                        <div className="flex items-center gap-2 text-slate-400 mr-2">
                            <Filter className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Filter:</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar w-full sm:w-auto">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === 'All'
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                                    }`}
                            >
                                All Stories
                            </button>
                            {categories?.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => setSelectedCategory(cat._id)}
                                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat._id
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {processedAnnouncements.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500">
                            <div className="text-6xl mb-6 grayscale opacity-40">📭</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Registry Empty</h3>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                {selectedCategory === 'All' ? "The news registry is currently being updated. Check back soon!" : "No stories found in this specific category."}
                            </p>
                            {selectedCategory !== 'All' && (
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-all active:scale-95"
                                >
                                    View All Articles
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Grid Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
                                {gridItems.map((announcement, idx) => (
                                    <div key={announcement._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 40}ms` }}>
                                        <AnnouncementCard announcement={announcement} />
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            {visibleCount < processedAnnouncements.length && (
                                <div className="text-center pt-12 border-t border-slate-200/60">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 8)}
                                        className="group px-12 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                                    >
                                        Explore More Stories
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-slate-100 py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">&copy; {new Date().getFullYear()} Notify CSC &bull; Institutional News Registry</p>
                </div>
            </footer>
        </div>
    );
};

export default NewsPage;


