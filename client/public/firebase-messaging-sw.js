// Import the functions you need from the SDKs you need
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbTyfSRN7EXQjnL_eeAQmmoMEceytQS2M",
    authDomain: "notifycsc.firebaseapp.com",
    projectId: "notifycsc",
    storageBucket: "notifycsc.firebasestorage.app",
    messagingSenderId: "164538541972",
    appId: "1:164538541972:web:64f1dce1722da665f35181",
    measurementId: "G-ZCKQ3DJW22"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch (error) {
    // Silent fail
}

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    try {
        const notificationTitle = payload.notification?.title || 'New Notification';
        const notificationOptions = {
            body: payload.notification?.body || '',
            icon: payload.notification?.icon || '/appIcon.jpg',
            badge: '/appIcon.jpg',
            tag: payload.data?.tag || 'notification',
            requireInteraction: false,
            data: {
                url: payload.data?.url || payload.fcmOptions?.link || '/',
                clickAction: payload.data?.clickAction || '/',
                ...payload.data
            }
        };

        return self.registration.showNotification(notificationTitle, notificationOptions);
    } catch (error) {
        // Silent fail
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || event.notification.data?.clickAction || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }).catch(error => {
            // Silent fail
        })
    );
});

// Service worker activation
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Service worker installation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});
