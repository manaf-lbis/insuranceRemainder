import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AddInsurance from './pages/AddInsurance'
import EditInsurance from './pages/EditInsurance'
import InsuranceList from './pages/InsuranceList'
import StaffList from './pages/StaffList'
import AddStaff from './pages/AddStaff'
import CheckInsurancePage from './pages/CheckInsurancePage'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import ManagePosters from './pages/ManagePosters'
import AnnouncementList from './pages/admin/AnnouncementList'
import ManageAnnouncement from './pages/admin/ManageAnnouncement'
import AnnouncementDetailPage from './pages/AnnouncementDetailPage'
import NewsPage from './pages/NewsPage'
import AboutPage from './pages/AboutPage'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import { ToastProvider } from './components/ToastContext'
import InstallPrompt from './components/InstallPrompt'
import WhatsAppButton from './components/WhatsAppButton'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <InstallPrompt />
                <WhatsAppButton />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/check-insurance" element={<CheckInsurancePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/news" element={<NewsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<AdminLayout />}>
                            {/* Common Protected Routes (Staff & Admin) */}
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/add-insurance" element={<AddInsurance />} />
                            <Route path="/edit-insurance/:id" element={<EditInsurance />} />
                            <Route path="/insurances" element={<InsuranceList />} />

                            {/* Admin Only Routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/staff" element={<StaffList />} />
                                <Route path="/admin/add-staff" element={<AddStaff />} />
                                <Route path="/admin/posters" element={<ManagePosters />} />
                                <Route path="/admin/announcements" element={<AnnouncementList />} />
                                <Route path="/admin/announcements/new" element={<ManageAnnouncement />} />
                                <Route path="/admin/announcements/edit/:id" element={<ManageAnnouncement />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </ToastProvider>
        </ErrorBoundary>
    )
}

export default App
