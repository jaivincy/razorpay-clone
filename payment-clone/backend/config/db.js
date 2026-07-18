const { Pool } = require('pg');
const { databaseUrl, databaseSsl } = require('./env');

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Add it to your .env file.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error', error);
});

module.exports = pool;