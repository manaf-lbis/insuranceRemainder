const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Configure Helmet with a more flexible CSP for SPAs
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "img-src": ["'self'", "data:", "https:", "http:"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "connect-src": ["'self'", "https:", "http:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

app.use(morgan('dev'));

// Static files (must be before API routes or after, but carefully ordered)
const publicPath = path.join(__dirname, '../../client/dist');
app.use(express.static(publicPath));

// Routes
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/insurances', require('./routes/insuranceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posters', require('./routes/posterRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    // Handle SPA routing: serve index.html for any non-API route
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(publicPath, 'index.html'));
        } else {
            res.status(404).json({ message: 'API Route not found' });
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}

// Error Middleware
app.use(errorHandler);

module.exports = app;
