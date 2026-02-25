const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

const categories = [
    { name: 'Aadhaar Card', description: 'Aadhaar related forms and documents' },
    { name: 'Ration Card', description: 'Ration card application and correction forms' },
    { name: 'Election ID', description: 'Voter ID related forms' },
    { name: 'Panchayat / Municipality', description: 'Local body certificates and forms' },
    { name: 'Income / Caste', description: 'Revenue department certificates' },
    { name: 'Driving License', description: 'RTO related forms' },
    { name: 'Insurance', description: 'Insurance claim and policy forms' },
    { name: 'Miscellaneous', description: 'Other useful documents' }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/insuranceRemainder');
        console.log('Connected to MongoDB for seeding...');

        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { name: cat.name },
                cat,
                { upsert: true, new: true }
            );
        }

        console.log('Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedCategories();
