const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
