import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AddInsurance from './pages/AddInsurance'
import InsuranceList from './pages/InsuranceList'
import StaffList from './pages/StaffList'
import AddStaff from './pages/AddStaff'
import PublicInsuranceCheck from './pages/PublicInsuranceCheck'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import { ToastProvider } from './components/ToastContext'

function App() {
    return (
        <ToastProvider>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicInsuranceCheck />} />
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/add-insurance" element={<AddInsurance />} />
                        <Route path="/insurances" element={<InsuranceList />} />
                    </Route>

                    <Route element={<AdminRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/admin/staff" element={<StaffList />} />
                            <Route path="/admin/add-staff" element={<AddStaff />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </ToastProvider>
    )
}

export default App
