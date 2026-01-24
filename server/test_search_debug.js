const http = require('http');

function testRequest(port, name) {
    const postData = JSON.stringify({
        searchType: 'vehicle',
        vehicleNumber: 'KL01AB1234'
    });

    const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/public/check-insurance',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log(`Testing ${name} on port ${port}...`);

    const req = http.request(options, (res) => {
        console.log(`${name} Status Code: ${res.statusCode}`);
        console.log(`${name} Headers:`, res.headers);

        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`${name} Body:`, data);
            if (!data) {
                console.log(`${name} ERROR: Empty response body!`);
            } else {
                try {
                    JSON.parse(data);
                    console.log(`${name} SUCCESS: Valid JSON`);
                } catch (e) {
                    console.log(`${name} ERROR: Invalid JSON - ${e.message}`);
                }
            }
        });
    });

    req.on('error', (e) => {
        console.error(`${name} Request Error: ${e.message}`);
    });

    req.write(postData);
    req.end();
}

// Test Server directly
testRequest(5000, 'SERVER');

// Test via Client Proxy (wait a bit to not mix logs too much)
setTimeout(() => {
    testRequest(5173, 'CLIENT_PROXY');
}, 2000);
