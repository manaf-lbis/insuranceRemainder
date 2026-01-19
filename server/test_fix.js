
const publicInsuranceService = require('./src/services/publicInsuranceService');
require('dotenv').config();
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
const User = require('./src/models/User');

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Insurance.deleteMany({ customerName: 'Test Fix' });

        let user = await User.findOne();
        if (!user) {
            console.error('No user found');
            process.exit(1);
        }

        console.log('\n--- TEST 1: Flexible Registration Number Matching ---');
        const record1 = new Insurance({
            registrationNumber: 'KL 01 BB 5555',
            customerName: 'Test Fix',
            mobileNumber: '8888888888',
            vehicleType: 'Four Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: new Date(),
            policyExpiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            createdBy: user._id
        });
        await record1.save();
        const result1 = await publicInsuranceService.checkInsuranceByVehicle('KL-01-BB-5555');
        console.log('Search "KL-01-BB-5555" ->', result1 ? 'FOUND: ' + result1[0].maskedVehicleNumber : 'NOT FOUND');

        console.log('\n--- TEST 2: Latest Record Retrieval ---');
        const record2 = new Insurance({
            registrationNumber: 'KL01BB5555',
            customerName: 'Test Fix',
            mobileNumber: '8888888888',
            vehicleType: 'Four Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
            policyExpiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            createdBy: user._id
        });
        await record2.save();
        const result2 = await publicInsuranceService.checkInsuranceByVehicle('KL01BB5555');
        console.log('Status (Should be ACTIVE):', result2[0].insuranceStatus);
        console.log('Days (Should be 10):', result2[0].daysToExpiry);

        console.log('\n--- TEST 3: Alternate Mobile Number Search ---');
        const recordAlt = new Insurance({
            registrationNumber: 'KL01ALT',
            customerName: 'Test Fix',
            mobileNumber: '1111111111',
            alternateMobileNumber: '2222222222',
            vehicleType: 'Four Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: new Date(),
            policyExpiryDate: new Date(),
            createdBy: user._id
        });
        await recordAlt.save();
        const resultAlt = await publicInsuranceService.checkInsuranceByMobile('2222222222');
        console.log('Search by Alternate Mobile "2222222222" ->', resultAlt ? 'FOUND: ' + resultAlt[0].maskedVehicleNumber : 'NOT FOUND');

        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        console.error(error.stack);
        process.exit(1);
    }
};

runTests();
