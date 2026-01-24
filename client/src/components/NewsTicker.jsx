import React from 'react';
import { Bell } from 'lucide-react';
import { useGetTickerAnnouncementsQuery } from '../features/announcements/announcementsApiSlice';

const NewsTicker = () => {
    const { data: announcements, isLoading, error } = useGetTickerAnnouncementsQuery();

    // Don't show ticker if loading, error, or no items
    if (isLoading || error || !announcements || announcements.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 overflow-hidden sticky top-0 z-40">
            <div className="flex items-center gap-3 px-4">
                <Bell size={16} className="flex-shrink-0 animate-pulse" />
                <div className="overflow-hidden flex-1">
                    <div className="animate-scroll whitespace-nowrap inline-block">
                        {announcements.map((item) => (
                            <span key={item._id} className="inline-block mx-8 text-sm font-medium">
                                📢 {item.title}
                            </span>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {announcements.map((item) => (
                            <span key={`dup-${item._id}`} className="inline-block mx-8 text-sm font-medium">
                                📢 {item.title}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
