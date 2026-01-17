const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const createdUser = await User.create({
            username: 'admin',
            password: 'password123',
            role: 'admin',
        });

        console.log('User Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();

        console.log('Data Destroyed!'.red ? 'Data Destroyed!'.red : 'Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`.red ? `${error}`.red : `${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
