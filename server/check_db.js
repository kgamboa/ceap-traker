const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  try {
    console.log('--- FASES ---');
    const fRes = await pool.query('SELECT id, nombre, numero_orden FROM fases ORDER BY numero_orden');
    console.table(fRes.rows);

    console.log('--- DOCUMENTOS PER PHASE ---');
    const dRes = await pool.query(`
      SELECT f.nombre as fase, COUNT(*) as count
      FROM ceap_fase_documentos d
      JOIN ceap_fases cf ON d.ceap_fase_id = cf.id
      JOIN fases f ON cf.fase_id = f.id
      GROUP BY f.nombre, f.numero_orden
      ORDER BY f.numero_orden
    `);
    console.table(dRes.rows);

    await pool.end();
  } catch (e) {
    console.error(e);
  }
}
check();
