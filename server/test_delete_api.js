const testDelete = async () => {
    try {
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        const token = loginData.token;

        const insurancesResponse = await fetch('http://localhost:5000/api/insurances', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const insurancesData = await insurancesResponse.json();

        if (!insurancesData.insurances || insurancesData.insurances.length === 0) {
            console.log('No insurances to delete');
            return;
        }

        const id = insurancesData.insurances[0]._id;
        console.log(`Attempting to delete insurance with ID: ${id}`);

        const deleteResponse = await fetch(`http://localhost:5000/api/insurances/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Delete status:', deleteResponse.status);
        const deleteData = await deleteResponse.json().catch(() => ({ message: 'No JSON response' }));
        console.log('Delete response:', deleteData);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testDelete();
