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
import AnalyticsDashboard from './pages/AnalyticsDashboard'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import { ToastProvider } from './components/ToastContext'
import InstallPrompt from './components/InstallPrompt'
import WhatsAppButton from './components/WhatsAppButton'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationPermission from './components/NotificationPermission'
import ContentProtection from './components/ContentProtection'
import { useSubscribeToNotificationsMutation } from './features/notifications/notificationsApiSlice'
import { messaging, onMessage } from './firebase'
import ScrollToTop from './components/ScrollToTop'


function App() {
    const [subscribeToNotifications] = useSubscribeToNotificationsMutation();

    // Register service worker
    React.useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            }).then((registration) => {
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Optionally reload the page to activate new service worker
                            // window.location.reload();
                        }
                    });
                });
            }).catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
        }

        // Handle foreground messages
        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                try {
                    // Show notification using browser API
                    if (Notification.permission === 'granted') {
                        const title = payload.notification?.title || 'New Notification';
                        const options = {
                            body: payload.notification?.body || '',
                            icon: payload.notification?.icon || '/appIcon.jpg',
                            badge: '/appIcon.jpg',
                            tag: payload.data?.tag || 'notification',
                            data: payload.data || {},
                            requireInteraction: false
                        };

                        const notification = new Notification(title, options);

                        // Handle notification click
                        notification.onclick = (event) => {
                            event.preventDefault();
                            const url = payload.data?.url || '/';
                            window.open(url, '_blank');
                            notification.close();
                        };
                    }
                } catch (error) {
                    console.error('Error showing foreground notification:', error);
                }
            });

            return () => {
                unsubscribe();
            };
        }
    }, []);

    const handlePermissionGranted = async (token) => {
        try {
            await subscribeToNotifications(token).unwrap();
        } catch (error) {
            console.error('Failed to save token to backend:', error);
            throw error;
        }
    };
    return (
        <ErrorBoundary>
            <ToastProvider>
                <ContentProtection />
                <InstallPrompt />
                <WhatsAppButton />
                <ScrollToTop />
                <NotificationPermission onPermissionGranted={handlePermissionGranted} />
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
                            <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                            <Route path="/admin/posters" element={<ManagePosters />} />
                            <Route path="/admin/announcements" element={<AnnouncementList />} />
                            <Route path="/admin/announcements/new" element={<ManageAnnouncement />} />
                            <Route path="/admin/announcements/edit/:id" element={<ManageAnnouncement />} />

                            {/* Admin Only Routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin/staff" element={<StaffList />} />
                                <Route path="/admin/add-staff" element={<AddStaff />} />
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </ToastProvider>
        </ErrorBoundary>
    )
}

export default App
