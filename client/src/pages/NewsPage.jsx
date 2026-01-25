import React, { useState, useMemo } from 'react';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { Loader, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { extractFirstImage } from '../utils/stringUtils';
import Navbar from '../components/Navbar';

const NewsCard = ({ announcement }) => {
    const firstImage = extractFirstImage(announcement.content);

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

    return (
        <Link to={`/announcements/${announcement._id}`} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 p-5 sm:p-6 block">
            <div className="flex gap-4 sm:gap-8">
                {/* Text Content */}
                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">News</span>
                        <span className="text-[10px] font-black text-slate-300">|</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CSC</span>
                    </div>

                    <h3 className="text-base sm:text-xl font-bold text-slate-900 font-poppins line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-4">
                        {announcement.title}
                    </h3>

                    <div className="mt-auto flex items-center text-xs text-slate-400 font-medium">
                        {timeAgo(announcement.createdAt)}
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {firstImage ? (
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                            <img
                                src={firstImage}
                                alt={announcement.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-2xl">
                            📢
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const NewsPage = () => {
    const { data: announcements, isLoading, error } = useGetPublicAnnouncementsQuery();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { paginatedAnnouncements, totalPages } = useMemo(() => {
        if (!announcements) return { paginatedAnnouncements: [], totalPages: 0 };

        const total = Math.ceil(announcements.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        return {
            paginatedAnnouncements: announcements.slice(start, end),
            totalPages: total
        };
    }, [announcements, currentPage]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar variant="solid" />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-blue-600 w-10 h-10" />
                        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-xs">Accessing News Registry...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <Navbar variant="solid" />

            <main className="flex-grow pt-24 pb-20">
                <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-poppins tracking-tighter mb-4">
                        News & <span className="text-blue-600 italic">Announcements</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-2xl leading-relaxed italic underline decoration-blue-500/10 underline-offset-8">
                        Stay informed with the latest policy updates and important notifications from the Notify CSC portal.
                    </p>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {error ? (
                        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-12 text-center">
                            <p className="text-rose-600 font-black uppercase tracking-widest text-sm mb-2">Registry Connection Failed</p>
                            <p className="text-rose-500 font-medium italic">Unable to synchronize with news database. Please check your connection.</p>
                        </div>
                    ) : announcements?.length === 0 ? (
                        <div className="bg-slate-100 rounded-[32px] p-20 text-center border border-slate-200 border-dashed">
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Registry Empty</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedAnnouncements.map((announcement) => (
                                    <NewsCard key={announcement._id} announcement={announcement} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-16 flex items-center justify-center gap-4">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${currentPage === i + 1
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">&copy; {new Date().getFullYear()} Notify CSC &bull; Digital Excellence</p>
                </div>
            </footer>
        </div>
    );
};

export default NewsPage;
