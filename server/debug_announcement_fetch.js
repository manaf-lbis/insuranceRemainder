const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Register models
require('./src/models/User');
const Announcement = require('./src/models/Announcement');

const testFetch = async () => {
    await connectDB();

    try {
        console.log('Fetching announcements...');
        const announcements = await Announcement.find({})
            .sort({ createdAt: -1 })
            .populate('author', 'username');

        console.log('Success!');
        console.log(JSON.stringify(announcements, null, 2));
    } catch (error) {
        console.error('FETCH ERROR:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

testFetch();
