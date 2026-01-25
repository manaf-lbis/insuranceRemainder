import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { extractFirstImage } from '../utils/stringUtils';
import { ArrowRight } from 'lucide-react';

const AnnouncementCard = ({ announcement }) => {
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
        <Link to={`/announcements/${announcement._id}`} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 p-5 flex flex-col h-full">
            <div className="flex gap-4 h-full">
                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">News</span>
                            <span className="text-[10px] font-black text-slate-300">|</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">CSC</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins line-clamp-3 leading-tight group-hover:text-blue-600 transition-colors mb-2">
                            {announcement.title}
                        </h3>
                    </div>

                    <div className="flex items-center text-xs text-slate-400 font-medium mt-auto">
                        {timeAgo(announcement.createdAt)}
                    </div>
                </div>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {firstImage ? (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
                            <img
                                src={firstImage}
                                alt={announcement.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-2xl">
                            📢
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

const AnnouncementsSection = ({ limit = 3 }) => {
    const { data: announcements, isLoading } = useGetPublicAnnouncementsQuery();

    const displayedAnnouncements = announcements?.slice(0, limit);

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

    if (!displayedAnnouncements || displayedAnnouncements.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50/50 py-12 sm:py-16 border-t border-slate-100 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6 sm:mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 font-poppins">Latest News</h2>
                        <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">Important updates from Notify CSC</p>
                    </div>
                    <Link to="/news" className="text-blue-600 hover:text-blue-700 font-bold text-sm sm:text-base flex items-center gap-1">
                        View All <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {displayedAnnouncements.map((announcement) => (
                        <AnnouncementCard key={announcement._id} announcement={announcement} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AnnouncementsSection;
