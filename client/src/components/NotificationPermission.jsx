import React, { useState, useEffect } from 'react';
import { X, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { messaging, getToken } from '../firebase';

const NotificationPermission = ({ onPermissionGranted }) => {
    const [show, setShow] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if already asked or granted
        const hasAsked = localStorage.getItem('notificationAsked');
        const permission = Notification.permission;

        if (!hasAsked && permission === 'default') {
            // Show banner after 3 seconds
            const timer = setTimeout(() => {
                setShow(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleEnable = async () => {
        setIsRequesting(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // Check if messaging is available
                if (!messaging) {
                    setError('Firebase messaging not initialized');
                    setIsRequesting(false);
                    return;
                }

                // Get FCM token with retry logic
                let token = null;
                let retries = 3;

                while (retries > 0 && !token) {
                    try {
                        token = await getToken(messaging, {
                            vapidKey: 'BNjkXQvKEaWeGhUTaj1N8-647MTaYRhGoZkZCE_L_4sCn1vLo4YNFLPNX4MnIgcjlHbCspU_9FlxKel1hvQVTlo'
                        });

                        if (token) {
                            // Send token to backend
                            try {
                                await onPermissionGranted(token);
                                setSuccess(true);

                                // Auto-hide after success
                                setTimeout(() => {
                                    setShow(false);
                                }, 2000);
                            } catch (subscribeError) {
                                setError('Failed to save subscription. Please try again.');
                            }
                        } else {
                            retries--;
                            if (retries > 0) {
                                await new Promise(resolve => setTimeout(resolve, 1000));
                            }
                        }
                    } catch (tokenError) {
                        retries--;
                        if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } else {
                            setError('Failed to get notification token. Please try again later.');
                        }
                    }
                }

                if (!token) {
                    setError('Could not retrieve notification token after multiple attempts.');
                }
            } else {
                setError('Notification permission denied. You can enable it later in your browser settings.');
            }

            localStorage.setItem('notificationAsked', 'true');
        } catch (error) {
            setError('An error occurred. Please try again.');
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
            <div className={`${success
                ? 'bg-gradient-to-r from-green-600 to-green-700'
                : error
                    ? 'bg-gradient-to-r from-red-600 to-red-700'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700'
                } text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3`}>
                <div className="bg-white/20 rounded-full p-2">
                    {success ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : error ? (
                        <AlertCircle className="w-5 h-5" />
                    ) : (
                        <Bell className="w-5 h-5" />
                    )}
                </div>
                <div className="flex-1">
                    {success ? (
                        <>
                            <p className="font-bold text-sm">Subscribed!</p>
                            <p className="text-xs text-green-100">You'll receive news updates</p>
                        </>
                    ) : error ? (
                        <>
                            <p className="font-bold text-sm">Subscription Failed</p>
                            <p className="text-xs text-red-100">{error}</p>
                        </>
                    ) : (
                        <>
                            <p className="font-bold text-sm">Get News Updates!</p>
                            <p className="text-xs text-blue-100">Subscribe to get instant notifications</p>
                        </>
                    )}
                </div>
                {!success && (
                    <button
                        onClick={handleEnable}
                        disabled={isRequesting}
                        className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRequesting ? 'Subscribing...' : error ? 'Retry' : 'Subscribe'}
                    </button>
                )}
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
