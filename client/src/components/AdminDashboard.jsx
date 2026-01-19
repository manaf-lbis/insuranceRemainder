import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetDashboardStatsQuery } from '../features/insurance/insuranceApiSlice'
import { ShieldAlert, Clock, AlertTriangle, CheckCircle, FileText, PlusCircle, List } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, subColor }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-full ${subColor}`}>
                <Icon className={`w-6 h-6 ${color.replace('border-', 'text-')}`} />
            </div>
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Overview</h1>
                <p className="mt-2 text-gray-600">Operational visibility and renewal tracking.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Link to="/insurances?status=EXPIRING_SOON" className="block transform transition-transform hover:scale-105">
                    <StatCard
                        title="Expiring Soon (7 Days)"
                        value={stats?.expiringSoon || 0}
                        icon={ShieldAlert}
                        color="border-orange-500"
                        subColor="bg-orange-100"
                    />
                </Link>
                <Link to="/insurances?status=EXPIRING_WARNING" className="block transform transition-transform hover:scale-105">
                    <StatCard
                        title="Warning (15 Days)"
                        value={stats?.expiringWarning || 0}
                        icon={AlertTriangle}
                        color="border-yellow-500"
                        subColor="bg-yellow-100"
                    />
                </Link>
                <Link to="/insurances?status=EXPIRED" className="block transform transition-transform hover:scale-105">
                    <StatCard
                        title="Expired"
                        value={stats?.totalExpired || 0}
                        icon={Clock}
                        color="border-red-500"
                        subColor="bg-red-100"
                    />
                </Link>
                <Link to="/insurances?status=ACTIVE" className="block transform transition-transform hover:scale-105">
                    <StatCard
                        title="Active Policies"
                        value={stats?.totalActive || 0}
                        icon={CheckCircle}
                        color="border-green-500"
                        subColor="bg-green-100"
                    />
                </Link>
            </div>

            {/* Quick Actions */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/add-insurance"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-900 group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Add New Record</h2>
                        <PlusCircle className="text-blue-900 group-hover:scale-110 transition-transform" size={28} />
                    </div>
                    <p className="text-gray-500">Create a new vehicle insurance entry.</p>
                </Link>

                <Link
                    to="/insurances"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-600 group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Renewal Queue</h2>
                        <FileText className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
                    </div>
                    <p className="text-gray-500">Manage list and sort by upcoming expiry.</p>
                </Link>

                <Link
                    to="/insurances?status=EXPIRED"
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500 group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Expired List</h2>
                        <Clock className="text-red-500 group-hover:scale-110 transition-transform" size={28} />
                    </div>
                    <p className="text-gray-500">View all expired policies that need action.</p>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard
