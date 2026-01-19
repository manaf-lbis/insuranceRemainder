
const publicInsuranceService = require('./src/services/publicInsuranceService');
require('dotenv').config();
const mongoose = require('mongoose');

const reproduce = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mobile = '9876543210';
        console.log(`Testing search for: "${mobile}"`);

        const result = await publicInsuranceService.checkInsuranceByMobile(mobile);
        console.log('Result:', JSON.stringify(result, null, 2));

        if (!result) {
            console.log('REPRODUCED: Result is null');

            // Debug the repository call
            const insuranceRepository = require('./src/repositories/insuranceRepository');
            const raw = await insuranceRepository.findAll({ mobileNumber: mobile });
            console.log('Raw Repository Result count:', raw.length);
            if (raw.length > 0) {
                console.log('First raw record mobile:', `"${raw[0].mobileNumber}"`);
            }
        } else {
            console.log('NOT REPRODUCED: Result found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

reproduce();
