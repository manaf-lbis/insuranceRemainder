
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const listAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const all = await Insurance.find();
        console.log('Total records:', all.length);
        all.forEach(r => {
            console.log(`Reg: ${r.registrationNumber} | Mobile: ${r.mobileNumber} | Alt: ${r.alternateMobileNumber} | Expiry: ${r.policyExpiryDate}`);
        });
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
};

listAll();
