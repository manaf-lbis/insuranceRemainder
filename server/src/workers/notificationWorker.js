const admin = require('firebase-admin');
const FCMToken = require('../models/FCMToken');

// Initialize Firebase Admin (same config as service)
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const messaging = admin.messaging();

// Listen for messages from parent process
process.on('message', async (message) => {
    if (message.type === 'SEND_BULK') {
        try {
            const { title, body, data } = message.payload;

            // Fetch all FCM tokens from database
            const tokens = await FCMToken.find().select('token');

            if (tokens.length === 0) {
                process.send({
                    type: 'COMPLETE',
                    result: { sent: 0, failed: 0, message: 'No subscribers found' }
                });
                return;
            }

            console.log(`Sending notifications to ${tokens.length} subscribers...`);

            let sent = 0;
            let failed = 0;
            const invalidTokens = [];

            // Send in batches of 500 (FCM limit)
            const batchSize = 500;
            for (let i = 0; i < tokens.length; i += batchSize) {
                const batch = tokens.slice(i, i + batchSize);

                // Create multicast message
                const multicastMessage = {
                    notification: {
                        title,
                        body,
                    },
                    data: data || {},
                    tokens: batch.map(t => t.token),
                };

                try {
                    const response = await messaging.sendEachForMulticast(multicastMessage);

                    sent += response.successCount;
                    failed += response.failureCount;

                    // Collect invalid tokens
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            const error = resp.error;
                            if (error.code === 'messaging/invalid-registration-token' ||
                                error.code === 'messaging/registration-token-not-registered') {
                                invalidTokens.push(batch[idx].token);
                            }
                        }
                    });

                    console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${response.successCount} sent, ${response.failureCount} failed`);
                } catch (error) {
                    console.error('Batch send error:', error);
                    failed += batch.length;
                }

                // Rate limiting: wait 100ms between batches
                if (i + batchSize < tokens.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Clean up invalid tokens
            if (invalidTokens.length > 0) {
                await FCMToken.deleteMany({ token: { $in: invalidTokens } });
                console.log(`Removed ${invalidTokens.length} invalid tokens`);
            }

            // Send results back to parent
            process.send({
                type: 'COMPLETE',
                result: {
                    sent,
                    failed,
                    removed: invalidTokens.length,
                    total: tokens.length
                }
            });

        } catch (error) {
            console.error('Worker error:', error);
            process.send({
                type: 'ERROR',
                error: error.message
            });
        }
    }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception in worker:', error);
    process.send({
        type: 'ERROR',
        error: error.message
    });
    process.exit(1);
});
