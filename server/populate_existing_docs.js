const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';

async function updateDocuments() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- RE-POBLANDO DOCUMENTOS DESDE EL CATÁLOGO ---');

    // 1. Limpiar tabla física
    await pool.query('DELETE FROM ceap_fase_documentos');

    // 2. Obtener todas las ceap_fases
    const fasesInCeaps = await pool.query(`
      SELECT cf.id as ceap_fase_id, f.numero_orden
      FROM ceap_fases cf
      JOIN fases f ON cf.fase_id = f.id
    `);

    console.log(`Poblando ${fasesInCeaps.rows.length} fases...`);

    for (const row of fasesInCeaps.rows) {
      // Insertar por cada documento del catálogo que corresponda a este orden de fase
      await pool.query(`
        INSERT INTO ceap_fase_documentos (ceap_fase_id, documento_id)
        SELECT $1, id 
        FROM ceap_documentos_catalog 
        WHERE fase_numero_orden = $2
      `, [row.ceap_fase_id, row.numero_orden]);
    }

    console.log(`✓ Proceso terminado.`);
    
    // Verificar
    const count = await pool.query('SELECT COUNT(*) FROM ceap_fase_documentos');
    console.log(`Total documentos en tabla: ${count.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

updateDocuments();
