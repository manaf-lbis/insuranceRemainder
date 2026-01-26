import React from 'react';
import Navbar from './Navbar';

const ShimmerLine = ({ className }) => (
    <div className={`bg-slate-200 animate-pulse rounded ${className}`}></div>
);

const PageShimmer = ({ variant = 'default' }) => {
    // Detail View (Header + Content) - for AnnouncementDetailPage
    if (variant === 'detail') {
        return (
            <div className="min-h-screen bg-white">
                <Navbar variant="solid" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                    {/* Header Shimmer */}
                    <div className="border-b border-gray-100 pb-8 mb-8">
                        <ShimmerLine className="h-10 w-3/4 mb-6" />
                        <div className="flex gap-6">
                            <ShimmerLine className="h-4 w-32" />
                            <ShimmerLine className="h-4 w-32" />
                        </div>
                    </div>

                    {/* Content Shimmer */}
                    <div className="space-y-4">
                        <ShimmerLine className="h-4 w-full" />
                        <ShimmerLine className="h-4 w-full" />
                        <ShimmerLine className="h-4 w-5/6" />
                        <ShimmerLine className="h-4 w-full" />
                        <ShimmerLine className="h-64 w-full rounded-2xl my-8" />
                        <ShimmerLine className="h-4 w-full" />
                        <ShimmerLine className="h-4 w-4/5" />
                    </div>
                </div>
            </div>
        );
    }

    // List View (Table/Rows) - for Admin Lists, Insurance List
    // We assume these pages usually have a container, but we can provide a generic one
    if (variant === 'list') {
        return (
            <div className="animate-fade-in w-full">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <ShimmerLine className="h-8 w-48" />
                        <ShimmerLine className="h-10 w-32 rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-lg">
                                <ShimmerLine className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <ShimmerLine className="h-5 w-1/3" />
                                    <ShimmerLine className="h-3 w-1/4" />
                                </div>
                                <ShimmerLine className="h-8 w-24 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default / Generic
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <ShimmerLine className="h-8 w-1/3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 h-64">
                        <ShimmerLine className="h-32 w-full mb-4 rounded-xl" />
                        <ShimmerLine className="h-6 w-3/4 mb-2" />
                        <ShimmerLine className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PageShimmer;
