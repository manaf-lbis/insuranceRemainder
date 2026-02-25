const errorHandler = (err, req, res, next) => {
    // Log the full error to server console for debugging
    console.error('--- SERVER ERROR ---');
    console.error('Status Code:', res.statusCode);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('--------------------');

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
