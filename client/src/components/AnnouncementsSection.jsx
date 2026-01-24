import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { Calendar, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';

const AnnouncementCard = ({ announcement }) => {
    const excerpt = DOMPurify.sanitize(announcement.content, { ALLOWED_TAGS: [] }).substring(0, 100) + '...';

    return (
        <Link to={`/announcements/${announcement._id}`} className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            {/* Thumbnail */}
            <div className="h-32 sm:h-48 bg-gray-100 relative overflow-hidden">
                {announcement.thumbnailUrl ? (
                    <img
                        src={announcement.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                        <span className="text-slate-300 font-bold text-sm sm:text-lg">No Image</span>
                    </div>
                )}
                <div className="absolute top-0 right-0 p-2 sm:p-3">
                    <span className="bg-white/90 backdrop-blur text-blue-900 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        News
                    </span>
                </div>
            </div>

            <div className="p-3 sm:p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-medium">
                    <Calendar size={12} className="text-emerald-500" />
                    {new Date(announcement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 font-poppins line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {announcement.title}
                </h3>

                <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1 leading-relaxed">
                    {excerpt}
                </p>

                <div className="mt-auto flex items-center text-xs sm:text-sm font-bold text-blue-600 group-hover:text-blue-700">
                    Read More <ArrowRight size={14} className="ml-1 transition-transform group-hover:translate-x-1" />
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
