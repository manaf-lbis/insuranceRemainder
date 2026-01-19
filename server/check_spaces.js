
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const checkSpaces = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const recordsWithSpaces = await Insurance.find({ registrationNumber: /\s/ });
        console.log('Records with spaces:', recordsWithSpaces.length);
        recordsWithSpaces.forEach(r => {
            console.log(`Reg: "${r.registrationNumber}"`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkSpaces();
