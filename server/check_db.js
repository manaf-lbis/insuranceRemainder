
const mongoose = require('mongoose');
const Insurance = require('./src/models/Insurance');
require('dotenv').config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name} | Count: ${count}`);
        }

        const insurances = await Insurance.find();
        console.log('Insurance records details:');
        insurances.forEach(r => {
            console.log(`Reg: "${r.registrationNumber}" | Mobile: "${r.mobileNumber}" | Expiry: ${r.policyExpiryDate}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
