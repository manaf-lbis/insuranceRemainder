import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { extractFirstImage } from '../utils/stringUtils';
import { timeAgo } from '../utils/dateUtils';
import { ArrowRight } from 'lucide-react';

export const AnnouncementCard = ({ announcement }) => {
    const firstImage = extractFirstImage(announcement.content);

    return (
        <Link to={`/announcements/${announcement._id}`} className="group bg-white rounded-3xl border border-slate-100/80 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-500 p-4 flex flex-col h-full active:scale-[0.98]">
            <div className="flex gap-4 h-full">
                {/* Text Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">News</span>
                        {announcement.priority === 'hot' && (
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Hot</span>
                        )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-poppins line-clamp-2 md:line-clamp-3 leading-snug group-hover:text-blue-600 transition-colors mb-4">
                        {announcement.title}
                    </h3>

                    <div className="flex items-center gap-2 mt-auto">
                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                            {(announcement.lastUpdatedBy?.username || announcement.author?.username || 'N')[0]?.toUpperCase()}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {announcement.lastUpdatedBy ? announcement.lastUpdatedBy.username : (announcement.author?.username || 'Admin')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap uppercase">{timeAgo(announcement.createdAt)}</span>
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {firstImage ? (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/50 relative">
                            <img
                                src={firstImage}
                                alt={announcement.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100/50 text-2xl grayscale group-hover:grayscale-0 transition-all">
                            📢
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const AnnouncementsSection = ({ limit: initialLimit = 3 }) => {
    // Fetch up to 50 items to ensure we have data for "Load More"
    const { data: announcements, isLoading } = useGetPublicAnnouncementsQuery(50);
    const [visibleCount, setVisibleCount] = React.useState(initialLimit);

    const processedAnnouncements = React.useMemo(() => {
        if (!announcements) return [];

        const now = new Date();
        return [...announcements]
            .filter(a => !a.expiresAt || new Date(a.expiresAt) > now)
            .sort((a, b) => {
                // Priority Sort: Hot first
                if (a.priority === 'hot' && b.priority !== 'hot') return -1;
                if (a.priority !== 'hot' && b.priority === 'hot') return 1;

                // Then Date Sort
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    }, [announcements]);

    const displayedAnnouncements = processedAnnouncements.slice(0, visibleCount);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
                <div className="h-6 sm:h-8 w-32 sm:w-48 bg-gray-200 rounded mb-6 sm:mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 sm:h-80 bg-gray-100 rounded-xl sm:rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!processedAnnouncements || processedAnnouncements.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50/50 py-12 sm:py-16 border-t border-slate-100 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6 sm:mb-10">
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 font-poppins tracking-tight">Latest News</h2>
                        <p className="text-slate-500 mt-1 text-sm sm:text-base font-medium">Verified updates & institutional announcements</p>
                    </div>
                    <Link to="/news" className="hidden sm:flex text-blue-600 hover:text-blue-700 font-black text-xs uppercase tracking-widest items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 transition-all">
                        View Registry <ArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {displayedAnnouncements.map((announcement) => (
                        <AnnouncementCard key={announcement._id} announcement={announcement} />
                    ))}
                </div>

                {visibleCount < processedAnnouncements.length && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 3)}
                            className="px-10 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-sm shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Load More Updates
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AnnouncementsSection;
