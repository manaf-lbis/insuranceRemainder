
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const findByMobile = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const mobile = '9876543210';

        const main = await Insurance.find({ mobileNumber: mobile });
        console.log(`Main Mobile Records (${mobile}):`, main.length);
        main.forEach(r => console.log(`Reg: ${r.registrationNumber}, Status: ${r.policyExpiryDate < new Date() ? 'EXPIRED' : 'ACTIVE'}, Expiry: ${r.policyExpiryDate}`));

        const alt = await Insurance.find({ alternateMobileNumber: mobile });
        console.log(`Alternate Mobile Records (${mobile}):`, alt.length);
        alt.forEach(r => console.log(`Reg: ${r.registrationNumber}, Status: ${r.policyExpiryDate < new Date() ? 'EXPIRED' : 'ACTIVE'}, Expiry: ${r.policyExpiryDate}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

findByMobile();
