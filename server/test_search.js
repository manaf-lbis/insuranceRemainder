
const publicInsuranceService = require('./src/services/publicInsuranceService');
require('dotenv').config();
const mongoose = require('mongoose');

const testSearch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- TEST SEARCH BY VEHICLE ---');
        const vehicleResult = await publicInsuranceService.checkInsuranceByVehicle('KL01EXPIRED');
        console.log('Vehicle Result:', JSON.stringify(vehicleResult, null, 2));

        console.log('--- TEST SEARCH BY MOBILE ---');
        const mobileResult = await publicInsuranceService.checkInsuranceByMobile('9999999999');
        console.log('Mobile Result:', JSON.stringify(mobileResult, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testSearch();
