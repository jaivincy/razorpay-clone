const pool = require('../config/db');

async function testDatabaseConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW() AS connected_at');
    console.log(`Database connection successful: ${rows[0].connected_at}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();