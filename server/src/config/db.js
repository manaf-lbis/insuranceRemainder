const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Keep window open if in a simple script run by user? 
    // Actually, just let it exit but with a delay if possible or just log clearly.
    console.error("Make sure MongoDB is running on port 27017!");
    process.exit(1);
  }
};

module.exports = connectDB;
