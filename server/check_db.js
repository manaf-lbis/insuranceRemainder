const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ username: 'admin' });
        if (admin) {
            console.log('ADMIN_FOUND');
            console.log('ID:', admin._id.toString());
            console.log('ACTIVE:', admin.isActive);
            console.log('APPROVED:', admin.isApproved);
        } else {
            console.log('ADMIN_NOT_FOUND');
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkUser();
