const errorHandler = (err, req, res, next) => {
    // Log the full error to server console for debugging
    console.error('--- SERVER ERROR ---');
    console.error('Status Code:', res.statusCode);
    console.error('Error Object:', err);
    if (err instanceof Error) {
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
    } else if (typeof err === 'string') {
        console.error('Error String:', err);
    } else {
        console.error('Error (JSON):', JSON.stringify(err, null, 2));
    }
    console.error('--------------------');

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: (err && err.message) ? err.message : (typeof err === 'string' ? err : 'Internal Server Error'),
        stack: process.env.NODE_ENV === 'production' ? null : (err && err.stack ? err.stack : null),
    });
};

module.exports = { errorHandler };
