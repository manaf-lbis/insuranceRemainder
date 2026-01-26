const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize only if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const messaging = admin.messaging();

/**
 * Send notification to a single device
 */
const sendNotification = async (token, title, body, data = {}) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data,
            token,
        };

        const response = await messaging.send(message);
        console.log('Successfully sent message:', response);
        return { success: true, response };
    } catch (error) {
        console.error('Error sending message:', error);

        // If token is invalid, return error so we can remove it from DB
        if (error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered') {
            return { success: false, invalidToken: true, error: error.message };
        }

        return { success: false, error: error.message };
    }
};

/**
 * Send notification to all subscribers using child process
 */
const sendToAll = async (title, body, data = {}) => {
    const { fork } = require('child_process');
    const path = require('path');

    return new Promise((resolve, reject) => {
        // Spawn child process to handle bulk sends
        const worker = fork(path.join(__dirname, '../workers/notificationWorker.js'));

        // Send task to worker
        worker.send({
            type: 'SEND_BULK',
            payload: { title, body, data }
        });

        // Listen for results
        worker.on('message', (message) => {
            if (message.type === 'COMPLETE') {
                console.log('Bulk notification send complete:', message.result);
                resolve(message.result);
                worker.kill();
            } else if (message.type === 'ERROR') {
                console.error('Bulk notification error:', message.error);
                reject(new Error(message.error));
                worker.kill();
            }
        });

        // Handle worker errors
        worker.on('error', (error) => {
            console.error('Worker error:', error);
            reject(error);
        });

        // Handle worker exit
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    });
};

module.exports = {
    sendNotification,
    sendToAll,
};
