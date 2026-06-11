const fetch = require('node-fetch');

async function main() {
  const url = 'http://localhost:5678/webhook/1/webhook/agent-webhook';
  console.log('Sending request to:', url);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'teste-dev-13',
        message: 'me fale sobre os equipamentos de segurança'
      })
    });
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response text:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

main();
