const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://n8n_user:n8n_password@localhost:5433/n8n_db'
  });
  await client.connect();
  
  console.log('--- WORKFLOW ENTITY ---');
  const entityRes = await client.query('SELECT nodes FROM workflow_entity WHERE id=\'1\';');
  console.log(JSON.stringify(entityRes.rows[0]?.nodes, null, 2));
  
  console.log('--- WORKFLOW HISTORY ---');
  const historyRes = await client.query('SELECT "versionId", nodes FROM workflow_history WHERE "workflowId"=\'1\' ORDER BY "createdAt" DESC LIMIT 3;');
  console.log(JSON.stringify(historyRes.rows, null, 2));

  await client.end();
}

main().catch(console.error);
