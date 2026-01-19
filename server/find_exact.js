
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const findExact = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mobile = '9876543210';

        const records = await Insurance.find({
            $or: [
                { mobileNumber: mobile },
                { alternateMobileNumber: mobile }
            ]
        });

        console.log(`Found ${records.length} records for ${mobile}`);
        records.forEach(r => {
            console.log(`Reg: ${r.registrationNumber} | Mobile: ${r.mobileNumber} | Alt: ${r.alternateMobileNumber}`);
        });

        if (records.length === 0) {
            console.log('No matches found. Listing first 5 records in DB:');
            const sample = await Insurance.find().limit(5);
            sample.forEach(r => {
                console.log(`Reg: ${r.registrationNumber} | Mobile: ${r.mobileNumber} | Alt: ${r.alternateMobileNumber}`);
            });
        }

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

findExact();
