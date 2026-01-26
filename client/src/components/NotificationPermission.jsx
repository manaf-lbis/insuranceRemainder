import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { messaging, getToken } from '../firebase';

const NotificationPermission = ({ onPermissionGranted }) => {
    const [show, setShow] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        // Check if already asked or granted
        const hasAsked = localStorage.getItem('notificationAsked');
        const permission = Notification.permission;

        if (!hasAsked && permission === 'default') {
            // Show modal after 3 seconds
            const timer = setTimeout(() => {
                setShow(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAllow = async () => {
        setIsRequesting(true);
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // Get FCM token
                const token = await getToken(messaging, {
                    vapidKey: 'BNjkXQvKEaWeGhUTaj1N8-647MTaYRhGoZkZCE_L_4sCn1vLo4YNFLPNX4MnIgcjlHbCspU_9FlxKel1hvQVTlo'
                });

                if (token) {
                    console.log('FCM Token:', token);
                    onPermissionGranted(token);
                }
            }

            localStorage.setItem('notificationAsked', 'true');
            setShow(false);
        } catch (error) {
            console.error('Error getting notification permission:', error);
        } finally {
            setIsRequesting(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem('notificationAsked', 'true');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-10 h-10 text-blue-600" />
                    </div>
                </div>

                {/* Content */}
                <h2 className="text-2xl font-black text-gray-900 text-center mb-3 font-poppins">
                    Stay Updated!
                </h2>
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                    Get instant notifications when we publish important news and announcements. Never miss an update!
                </p>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span className="text-gray-700">Breaking news delivered instantly</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span className="text-gray-700">Important updates you can't miss</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-0.5">✓</span>
                        <span className="text-gray-700">You can unsubscribe anytime</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 px-6 py-3 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={handleAllow}
                        disabled={isRequesting}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRequesting ? 'Enabling...' : 'Enable Notifications'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPermission;
