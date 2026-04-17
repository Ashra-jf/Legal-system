const fetch = require('node-fetch');

async function runTests() {
    console.log('--- Starting API Verification ---');
    try {
        // Test Health
        let res = await fetch('http://localhost:5000/api/health');
        let data = await res.json();
        console.log('Health:', data);

        // Test Services
        res = await fetch('http://localhost:5000/api/services');
        data = await res.json();
        console.log('Services count:', Array.isArray(data) ? data.length : data);

        // Test Lawyers (Profiles)
        res = await fetch('http://localhost:5000/api/profile/lawyers');
        data = await res.json();
        console.log('Lawyers count:', Array.isArray(data) ? data.length : data);

        console.log('--- API Verification Completed Successfully ---');
    } catch (e) {
        console.error('Error during testing:', e.message);
    }
}

runTests();
