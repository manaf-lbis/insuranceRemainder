// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
export default app;
