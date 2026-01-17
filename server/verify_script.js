// using native fetch (Node 18+)
// Since I can't easily install packages, I will use native fetch (Node 18+)
// Assuming Node 18+ is available properly. If not, I'll use http module.
// Checking node version: v22.14.0 (from previous logs). So fetch is available.

const BASE_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });

        if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.statusText}`);
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('   Login successful. Token obtained.');

        // 2. Test Invalid Create
        console.log('\n2. Testing Invalid Create (Expect 400)...');
        const invalidResponse = await fetch(`${BASE_URL}/insurances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        const invalidData = await invalidResponse.json();
        console.log(`   Status: ${invalidResponse.status} (Expected 400)`);
        console.log(`   Response: ${JSON.stringify(invalidData)}`);

        // 3. Test Valid Create
        console.log('\n3. Testing Valid Create...');
        const validPayload = {
            registrationNumber: `KA01AB${Math.floor(Math.random() * 10000)}`,
            customerName: 'John Doe',
            mobileNumber: '9876543210',
            vehicleType: 'Two Wheeler',
            insuranceType: 'Third Party',
            policyStartDate: '2023-01-01',
            policyExpiryDate: '2024-01-01',
            remarks: 'Test Entry'
        };

        const validResponse = await fetch(`${BASE_URL}/insurances`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validPayload)
        });

        if (!validResponse.ok) {
            const error = await validResponse.json();
            throw new Error(`Create failed: ${JSON.stringify(error)}`);
        }
        const createdData = await validResponse.json();
        console.log(`   Create successful. ID: ${createdData._id}`);

        // 4. Test Get All
        console.log('\n4. Testing Get All...');
        const getResponse = await fetch(`${BASE_URL}/insurances`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!getResponse.ok) throw new Error(`Get failed: ${getResponse.statusText}`);
        const listData = await getResponse.json();
        console.log(`   Get successful. Count: ${listData.length}`);
        console.log(`   First Item ID: ${listData[0]._id}`);

        console.log('\nVERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('\nVERIFICATION FAILED:', error.message);
    }
}

verify();
