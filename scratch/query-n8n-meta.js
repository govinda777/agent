const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://n8n_user:n8n_password@localhost:5433/n8n_db'
  });
  await client.connect();
  
  const users = await client.query('SELECT id, email FROM "user";');
  console.log('USERS:', JSON.stringify(users.rows, null, 2));
  
  const projects = await client.query('SELECT id, name FROM "project";');
  console.log('PROJECTS:', JSON.stringify(projects.rows, null, 2));

  await client.end();
}

main().catch(console.error);
