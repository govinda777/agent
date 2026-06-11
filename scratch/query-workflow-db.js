const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://n8n_user:n8n_password@localhost:5433/n8n_db'
  });
  await client.connect();
  const res = await client.query('SELECT id, name, active, "versionId", "activeVersionId" FROM workflow_entity;');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(console.error);
