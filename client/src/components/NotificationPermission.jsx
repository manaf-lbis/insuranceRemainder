import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { messaging, getToken } from '../firebase';

const NotificationPermission = ({ onPermissionGranted }) => {
    const [show, setShow] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        console.log('🔔 NotificationPermission component mounted');

        // Check if already asked or granted
        const hasAsked = localStorage.getItem('notificationAsked');
        const permission = Notification.permission;

        console.log('Notification status:', { hasAsked, permission });

        if (!hasAsked && permission === 'default') {
            // Show banner after 3 seconds
            console.log('⏰ Will show notification banner in 3 seconds...');
            const timer = setTimeout(() => {
                console.log('✅ Showing notification banner now!');
                setShow(true);
            }, 3000);
            return () => clearTimeout(timer);
        } else {
            console.log('❌ Not showing banner:', hasAsked ? 'Already asked' : `Permission is ${permission}`);
        }
    }, []);

    const handleEnable = async () => {
        setIsRequesting(true);
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                console.log('✅ Permission granted, getting FCM token...');

                // Check if messaging is available
                if (!messaging) {
                    console.error('Firebase messaging not initialized');
                    return;
                }

                // Get FCM token
                try {
                    const token = await getToken(messaging, {
                        vapidKey: 'BNjkXQvKEaWeGhUTaj1N8-647MTaYRhGoZkZCE_L_4sCn1vLo4YNFLPNX4MnIgcjlHbCspU_9FlxKel1hvQVTlo'
                    });

                    if (token) {
                        console.log('✅ FCM Token received:', token);
                        await onPermissionGranted(token);
                    } else {
                        console.error('No FCM token received');
                    }
                } catch (tokenError) {
                    console.error('Error getting FCM token:', tokenError);
                }
            } else {
                console.log('❌ Permission denied');
            }

            localStorage.setItem('notificationAsked', 'true');
            setShow(false);
        } catch (error) {
            console.error('Error requesting permission:', error);
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
        <div className="fixed bottom-4 right-4 z-[9999] max-w-sm animate-in slide-in-from-bottom duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                    <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="font-bold text-sm">Get News Updates!</p>
                    <p className="text-xs text-blue-100">Enable notifications for latest news</p>
                </div>
                <button
                    onClick={handleEnable}
                    disabled={isRequesting}
                    className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                    {isRequesting ? 'Enabling...' : 'Enable'}
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default NotificationPermission;
