const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/public', require('./routes/publicRoutes')); // Public routes (no auth)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/insurances', require('./routes/insuranceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Middleware
app.use(errorHandler);

module.exports = app;
