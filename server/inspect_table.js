const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';

async function describeTable() {
  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ceap_fases'
    `);
    console.table(res.rows);
  } finally { await pool.end(); }
}
describeTable();
