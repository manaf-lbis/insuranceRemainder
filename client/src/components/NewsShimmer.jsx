import React from 'react';

const ShimmerEffect = ({ className }) => {
    return (
        <div className={`animate-pulse bg-slate-200 ${className}`}></div>
    );
};

const NewsShimmer = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header Shimmer */}
            <div className="mb-12">
                <ShimmerEffect className="w-32 h-6 rounded-full mb-4" />
                <ShimmerEffect className="w-64 h-12 rounded-lg mb-4" />
                <ShimmerEffect className="w-full max-w-2xl h-6 rounded-lg" />
            </div>

            {/* Hero Section Shimmer */}
            <div className="mb-16">
                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm p-2">
                    <div className="aspect-[21/9] w-full rounded-[24px] bg-slate-100 relative overflow-hidden">
                        <ShimmerEffect className="absolute inset-0 w-full h-full" />
                    </div>
                </div>
            </div>

            {/* Grid Shimmer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="bg-white rounded-3xl p-4 border border-slate-100 h-full flex flex-col">
                        <div className="aspect-video w-full rounded-2xl bg-slate-100 mb-4 overflow-hidden relative">
                            <ShimmerEffect className="absolute inset-0" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <ShimmerEffect className="w-16 h-3 rounded-full" />
                                <ShimmerEffect className="w-16 h-3 rounded-full" />
                            </div>
                            <ShimmerEffect className="w-full h-6 rounded" />
                            <ShimmerEffect className="w-3/4 h-6 rounded" />
                            <div className="pt-4 mt-auto">
                                <ShimmerEffect className="w-24 h-4 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewsShimmer;
