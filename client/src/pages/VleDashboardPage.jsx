import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    FileText,
    CheckCircle,
    Clock,
    Download,
    Users,
    TrendingUp,
    Trophy,
    ArrowRight,
    Store,
    LayoutDashboard
} from 'lucide-react'
import VleLayout from '../components/VleLayout'
import {
    useGetDocStatsQuery,
    useGetTopContributorsQuery,
    useGetDocumentsQuery
} from '../features/vle/vleAuthApiSlice'

const VleDashboardPage = () => {
    const { user } = useSelector((state) => state.auth)
    const { data: stats, isLoading: statsLoading } = useGetDocStatsQuery()
    const { data: topContributors, isLoading: topsLoading } = useGetTopContributorsQuery()
    // Fetch only approved docs for the recent feed
    const { data: recentDocsData, isLoading: docsLoading } = useGetDocumentsQuery({ status: 'approved', limit: 5 })
    const recentDocs = recentDocsData?.documents || []

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

    const statCards = [
        {
            label: 'My Contributions',
            value: stats?.myContributions || 0,
            icon: FileText,
            link: '/vle/contributions'
        },
        {
            label: 'Total Downloads',
            value: stats?.myDownloads || 0,
            icon: Download,
            link: '/vle/contributions'
        },
        {
            label: 'Pending Approval',
            value: stats?.myPending || 0,
            icon: Clock,
            link: '/vle/contributions'
        },
        {
            label: 'Approved Files',
            value: stats?.myApproved || 0,
            icon: CheckCircle,
            link: '/vle/contributions'
        }
    ]

    return (
        <VleLayout>
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                                <LayoutDashboard className="h-4 w-4" />
                                <span>Overview</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {greeting}, <span className="text-primary">{user?.name || user?.username}</span>
                            </h1>
                            <p className="text-slate-500 font-medium">
                                Track your contributions and library activity.
                            </p>
                        </div>
                        {user?.shopName && (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
                                <Store className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Your Center</p>
                                    <p className="text-sm font-bold text-slate-700">{user.shopName}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Minimalist Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statCards.map((stat, idx) => (
                            <Link
                                to={stat.link || '#'}
                                key={idx}
                                className="group block bg-white p-5 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide group-hover:text-primary transition-colors">
                                        {stat.label}
                                    </h3>
                                    <stat.icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl font-black text-slate-900">
                                        {statsLoading ? '...' : stat.value}
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Feed Section */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 mb-2">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                    Latest Community Approvals
                                </h2>
                                <Link to="/vle/documents" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                    View Library <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>

                            {docsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white border border-slate-100 animate-pulse rounded-xl" />)}
                                </div>
                            ) : recentDocs?.length > 0 ? (
                                <div className="space-y-3">
                                    {recentDocs.map((doc) => (
                                        <div key={doc._id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-primary/20 transition-all flex items-center gap-4">
                                            <div className="h-10 w-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg text-slate-400 shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 truncate">{doc.title}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                                        {doc.category?.name || 'General'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        by {doc.uploadedBy?.shopName || doc.uploadedBy?.name || 'Operator'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="flex items-center gap-1 text-slate-500 justify-end">
                                                    <Download className="h-3 w-3" />
                                                    <span className="text-xs font-semibold">{doc.downloadCount}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {new Date(doc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border text-center border-slate-200 rounded-xl p-8">
                                    <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500 font-medium">No approved files found yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-yellow-500" />
                                    <h2 className="text-base font-bold text-slate-900">Leaderboard</h2>
                                </div>

                                <div className="p-4 space-y-3">
                                    {topsLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />)}
                                        </div>
                                    ) : topContributors?.length > 0 ? (
                                        topContributors.map((contributor, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className={`h-6 w-6 flex items-center justify-center rounded text-[10px] font-bold ${idx === 0 ? 'bg-yellow-100 justify-center text-yellow-700' :
                                                        idx === 1 ? 'bg-slate-100 text-slate-600' :
                                                            idx === 2 ? 'bg-amber-50 text-amber-700' :
                                                                'bg-slate-50 text-slate-400 border border-slate-100'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{contributor.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{contributor.shopName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-slate-700">{contributor.docCount}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-center py-4 text-xs font-medium">No contributions yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-3 items-start">
                                <Users className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <h4 className="text-slate-900 font-bold text-sm mb-1">Upload Guidelines</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Ensure your documents are clear, properly categorized, and do not contain sensitive personal customer data before submitting to the community library.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VleLayout>
    )
}

export default VleDashboardPage
