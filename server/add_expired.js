
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
const User = require('./src/models/User');
require('dotenv').config();

const addExpiredRecord = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let user = await User.findOne({ username: 'admin' });
        if (!user) {
            user = await User.findOne();
        }

        if (!user) {
            console.error('No user found to associate with insurance');
            process.exit(1);
        }

        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 10); // 10 days ago

        const record = new Insurance({
            registrationNumber: 'KL01EXPIRED',
            customerName: 'Test Expired',
            mobileNumber: '9999999999',
            vehicleType: 'Four Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: new Date(2025, 0, 1),
            policyExpiryDate: expiredDate,
            createdBy: user._id
        });

        await record.save();
        console.log('Expired record added:', record.registrationNumber);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

addExpiredRecord();
