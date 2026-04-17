const fetch = require('node-fetch');

async function testLogin() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'ash.jf07@gmail.com', password: 'password123' })
        });
        const data = await res.json();
        console.log('Login Response Status:', res.status);
        console.log('Login Response Data:', data);
    } catch (e) {
        console.error('Test error:', e.message);
    }
}

testLogin();
