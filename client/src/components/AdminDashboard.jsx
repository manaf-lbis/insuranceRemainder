import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetDashboardStatsQuery } from '../features/insurance/insuranceApiSlice'
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, FileText, PlusCircle, List } from 'lucide-react'

const StatCard = ({ title, value, change, icon: Icon, colorClass, gradientClass }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-100 group`}>
        {/* Background Gradient Decoration */}
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${colorClass}`}></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${gradientClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                </div>
                {change && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {change} this month
                    </span>
                )}
            </div>

            <h3 className="text-3xl font-bold text-gray-800 tracking-tight font-poppins">{value}</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-1">{title}</p>
        </div>
    </div>
)

const AdminDashboard = () => {
    const { data: stats, isLoading, isError, error, refetch } = useGetDashboardStatsQuery()

    // Refetch on mount to ensure fresh data
    useEffect(() => {
        refetch()
    }, [refetch])

    if (isLoading) {
        return <div className="text-center py-10">Loading dashboard stats...</div>
    }

    if (isError) {
        return (
            <div className="text-center py-10 text-red-600">
                Error loading stats: {error?.data?.message || 'Access Denied'}
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins">
                        Good morning, Admin 👋
                    </h1>
                    <p className="mt-2 text-sm md:text-base text-gray-500">
                        Here’s what needs your attention today.
                    </p>
                </div>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 font-medium">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
                <Link to="/insurances?status=ACTIVE" className="block">
                    <StatCard
                        title="Active Policies"
                        value={stats?.totalActive || 0}
                        change="+4"
                        icon={CheckCircle}
                        colorClass="bg-emerald-500"
                        gradientClass="bg-gradient-to-br from-emerald-400 to-emerald-600"
                    />
                </Link>
                <Link to="/insurances?status=EXPIRING_SOON" className="block">
                    <StatCard
                        title="Expiring (7 Days)"
                        value={stats?.expiringSoon || 0}
                        icon={ShieldAlert}
                        colorClass="bg-orange-500"
                        gradientClass="bg-gradient-to-br from-orange-400 to-orange-600"
                    />
                </Link>
                <Link to="/insurances?status=EXPIRING_WARNING" className="block">
                    <StatCard
                        title="Warning (15 Days)"
                        value={stats?.expiringWarning || 0}
                        icon={AlertTriangle}
                        colorClass="bg-amber-500"
                        gradientClass="bg-gradient-to-br from-amber-400 to-amber-600"
                    />
                </Link>
                <Link to="/insurances?status=EXPIRED" className="block">
                    <StatCard
                        title="Expired"
                        value={stats?.totalExpired || 0}
                        icon={Clock}
                        colorClass="bg-rose-500"
                        gradientClass="bg-gradient-to-br from-rose-400 to-rose-600"
                    />
                </Link>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                <Link
                    to="/add-insurance"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="mb-4 p-4 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                        <PlusCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins relative z-10">Add Record</h3>
                    <p className="text-sm text-gray-500 hidden md:block relative z-10">Register new insurance entry</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-blue-600 font-semibold text-sm flex items-center gap-1">
                        Get Started →
                    </div>
                </Link>

                <Link
                    to="/insurances"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="mb-4 p-4 bg-indigo-100 text-indigo-600 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins relative z-10">Renewal Queue</h3>
                    <p className="text-sm text-gray-500 hidden md:block relative z-10">Track upcoming renewals</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-indigo-600 font-semibold text-sm flex items-center gap-1">
                        View List →
                    </div>
                </Link>

                <Link
                    to="/insurances?status=EXPIRED"
                    className="group relative bg-white overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 p-6 flex flex-col items-center text-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="mb-4 p-4 bg-rose-100 text-rose-600 rounded-full group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins relative z-10">Expired Policies</h3>
                    <p className="text-sm text-gray-500 hidden md:block relative z-10">Action required immediately</p>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-rose-600 font-semibold text-sm flex items-center gap-1">
                        Review Now →
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard
