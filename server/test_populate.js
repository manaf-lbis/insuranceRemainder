
const mongoose = require('mongoose');
require('dotenv').config();

const testPopulate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Register Insurance but NOT User
        const Insurance = require('./src/models/Insurance');

        console.log('Attempting findAll with populate...');
        try {
            const result = await Insurance.find().populate('createdBy', 'username');
            console.log('Success!');
        } catch (err) {
            console.error('Caught expected error:', err.name, '-', err.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Setup error:', error);
        process.exit(1);
    }
};

testPopulate();
