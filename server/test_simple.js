
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected');

        const record = new Insurance({
            registrationNumber: 'KL 01 BB 5555',
            customerName: 'Test Normalization',
            mobileNumber: '8888888888',
            vehicleType: 'Four Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: new Date(),
            policyExpiryDate: new Date(),
            createdBy: new mongoose.Types.ObjectId()
        });

        console.log('Before save:', record.registrationNumber);
        await record.validate();
        console.log('After validate:', record.registrationNumber);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testSave();
