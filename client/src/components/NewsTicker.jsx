import React from 'react';
import { Megaphone, Zap } from 'lucide-react';
import { useGetTickerAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';

const NewsTicker = ({ top = 'top-0' }) => {
    const { data: announcements, isLoading, error } = useGetTickerAnnouncementsQuery();

    // Don't show ticker if loading, error, or no items
    if (isLoading || error || !announcements || announcements.length === 0) {
        return null;
    }

    return (
        <div className={`bg-blue-900 text-white py-3 overflow-hidden sticky ${top} z-50 shadow-md shadow-blue-900/10 border-b border-blue-800`}>
            <div className="flex items-center gap-4 px-4 max-w-7xl mx-auto relative">
                {/* Left Badge */}
                <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-700/50 border border-blue-600 shadow-sm z-10">
                    <Megaphone size={16} className="text-yellow-400 animate-bounce" />
                    <span className="hidden sm:inline text-xs font-black text-white uppercase tracking-widest leading-none">News</span>
                </div>

                {/* Scrolling Content */}
                <div className="overflow-hidden flex-1">
                    <div className="animate-scroll whitespace-nowrap inline-flex items-center">
                        {announcements.map((item) => (
                            <div key={item._id} className="inline-flex items-center mx-6 sm:mx-10 group cursor-pointer">
                                <Zap size={16} className="text-yellow-400 mr-2 flex-shrink-0" />
                                <span className="text-base sm:text-lg font-bold text-white tracking-wide hover:text-blue-200 transition-colors">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {announcements.map((item) => (
                            <div key={`dup-${item._id}`} className="inline-flex items-center mx-6 sm:mx-10 group cursor-pointer">
                                <Zap size={16} className="text-yellow-400 mr-2 flex-shrink-0" />
                                <span className="text-base sm:text-lg font-bold text-white tracking-wide hover:text-blue-200 transition-colors">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
