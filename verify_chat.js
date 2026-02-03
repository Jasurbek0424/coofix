const fetch = require('node-fetch');

async function verifyChat() {
    const port = process.env.PORT || 8000;
    const url = `http://localhost:${port}/api/chat`;

    console.log(`Sending request to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Hello, are you working?'
            })
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (data.success) {
            console.log('Verification SUCCESS!');
        } else {
            console.log('Verification FAILED.');
        }
    } catch (error) {
        console.error('Verification Error:', error.message);
    }
}

verifyChat();
