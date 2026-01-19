const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const updateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const res = await User.updateOne({ username: 'admin' }, { $set: { role: 'admin' } });
        console.log('Update Result:', res);

        console.log('Admin role updated successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

updateAdmin();
