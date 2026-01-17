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

// Routes (Placeholders for now)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Middleware
app.use(errorHandler);

module.exports = app;
