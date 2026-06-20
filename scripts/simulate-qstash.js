const http = require('http');

/**
 * AGENT 2026: QSTASH LOCAL SIMULATOR
 *
 * Este script simula o comportamento do broker Upstash QStash localmente.
 * Ele recebe eventos do DurableBus e os encaminha para o webhook de projeções do Next.js.
 */

const PORT = 8080;
const NEXT_WEBHOOK_URL = 'http://localhost:3000/api/webhooks/projections';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        console.log(`[QStash-Sim] Received event: ${event.eventType} (${event.aggregateId})`);

        // Simula o delay de rede e o processamento assíncrono
        setTimeout(async () => {
            console.log(`[QStash-Sim] Forwarding to Next.js Webhook...`);
            try {
                const response = await fetch(NEXT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event)
                });

                if (response.ok) {
                    console.log(`[QStash-Sim] ✅ Event processed by Next.js`);
                } else {
                    console.error(`[QStash-Sim] ❌ Next.js returned error: ${response.status}`);
                }
            } catch (err) {
                console.error(`[QStash-Sim] ❌ Failed to connect to Next.js:`, err.message);
            }
        }, 500);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ messageId: 'sim_' + Math.random().toString(36).substr(2, 9) }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`🚀 QStash Local Simulator running at http://localhost:${PORT}`);
  console.log(`Roteando eventos para: ${NEXT_WEBHOOK_URL}`);
});
