import React from 'react';
import { useGetPublicAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const NewsCard = ({ announcement }) => {
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
        <Link to={`/announcements/${announcement._id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 block p-4">
            <div className="flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NEWS</span>
                        <span className="text-[10px] font-black text-slate-300">|</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KERALA</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 font-poppins line-clamp-3 leading-tight group-hover:text-blue-600 transition-colors mb-2">
                        {announcement.title}
                    </h3>
                </div>

                <div className="flex items-center text-xs text-slate-400 font-medium">
                    {timeAgo(announcement.createdAt)}
                </div>
            </div>
        </Link>
    );
};

const NewsPage = () => {
    const { data: announcements, isLoading, error } = useGetPublicAnnouncementsQuery();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-blue-900 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5">
                        <span className="text-lg font-bold text-white font-poppins tracking-wide">
                            Notify CSC
                        </span>
                    </Link>
                    <div className="flex gap-4">
                        <Link to="/services" className="text-sm font-medium text-blue-100 hover:text-white transition-colors px-3 py-2">
                            Our Services
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-poppins mb-2">Latest News & Updates</h1>
                    <p className="text-slate-500">Stay informed with our latest announcements and updates</p>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-blue-600 w-10 h-10" />
                    </div>
                )}

                {error && (
                    <div className="text-center py-20">
                        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
                            <p className="text-red-600 font-medium mb-2">Unable to load news</p>
                            <p className="text-red-500 text-sm">Please try refreshing the page</p>
                        </div>
                    </div>
                )}

                {!isLoading && !error && announcements?.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        No news available at the moment.
                    </div>
                )}

                {!isLoading && !error && announcements && announcements.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {announcements.map((announcement) => (
                            <NewsCard key={announcement._id} announcement={announcement} />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Notify CSC. Serving you with trust.</p>
                </div>
            </footer>
        </div>
    );
};

export default NewsPage;
