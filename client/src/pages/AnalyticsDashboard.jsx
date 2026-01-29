import React from 'react';
import { useGetAnnouncementStatsQuery } from '../features/announcements/announcementsApiSlice';
import { Eye, FileText, CheckCircle, TrendingUp, BarChart3, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, subtitle }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100 group`}>
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${colorClass}`}></div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${gradientClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 tracking-tight font-poppins">{value}</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    </div>
);

const AnalyticsDashboard = () => {
    const { data: stats, isLoading, isError } = useGetAnnouncementStatsQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-10 text-red-600">
                Error loading analytics
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins">
                        📊 News & Media Analytics
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-500">
                        Track engagement, views, and content performance
                    </p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                <StatCard
                    title="Total Views"
                    value={stats?.totalViews?.toLocaleString() || 0}
                    icon={Eye}
                    colorClass="bg-blue-500"
                    gradientClass="bg-gradient-to-br from-blue-400 to-blue-600"
                    subtitle="All-time engagement"
                />
                <StatCard
                    title="Published News"
                    value={stats?.publishedCount || 0}
                    icon={CheckCircle}
                    colorClass="bg-emerald-500"
                    gradientClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
                    subtitle="Active announcements"
                />
                <StatCard
                    title="Total Content"
                    value={stats?.totalAnnouncements || 0}
                    icon={FileText}
                    colorClass="bg-indigo-500"
                    gradientClass="bg-gradient-to-br from-indigo-400 to-indigo-600"
                    subtitle="Published + drafts"
                />
                <StatCard
                    title="Avg. Views"
                    value={stats?.totalAnnouncements && stats?.totalViews
                        ? Math.round(stats.totalViews / stats.totalAnnouncements)
                        : 0}
                    icon={TrendingUp}
                    colorClass="bg-amber-500"
                    gradientClass="bg-gradient-to-br from-amber-400 to-amber-600"
                    subtitle="Per announcement"
                />
            </div>

            {/* Top Performing Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="text-blue-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900 font-poppins">Top Performing Content</h2>
                    </div>
                    <Link to="/admin/announcements" className="text-sm font-bold text-blue-600 hover:underline">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Author</th>
                                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Published</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stats?.topPerforming?.length > 0 ? (
                                stats.topPerforming.map((item, index) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-50 text-blue-600'
                                                }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/announcements/edit/${item._id}`}
                                                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                                            >
                                                {item.title}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {item.author?.username || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700">
                                                <Eye size={14} />
                                                {item.views?.toLocaleString() || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No published content yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/admin/announcements/new"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex items-center gap-4"
                >
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Create News</h3>
                        <p className="text-sm text-gray-500">Publish new announcement</p>
                    </div>
                </Link>
                <Link
                    to="/admin/announcements"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex items-center gap-4"
                >
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Manage Content</h3>
                        <p className="text-sm text-gray-500">Edit & organize posts</p>
                    </div>
                </Link>
                <Link
                    to="/admin/posters"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex items-center gap-4"
                >
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Hero Engine</h3>
                        <p className="text-sm text-gray-500">Manage hero posters</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
