const { Pool } = require('pg');
const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';
const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function testUpdate() {
  const ceapFaseId = '206dc7dd-c87d-4921-ac84-fc6908df13e8';
  const documentoId = '19'; // Like what comes from req.params
  const capturado_plantel = true;

  try {
     console.log('Testing update with params:', { ceapFaseId, documentoId, capturado_plantel });
     const result = await pool.query(
        `UPDATE ceap_fase_documentos 
         SET capturado_plantel = $1, 
             fecha_captura = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE ceap_fase_id = $2 AND documento_id = $3
         RETURNING *`,
        [capturado_plantel, ceapFaseId, documentoId]
      );
      console.log('Update result rows:', result.rows.length);
      
      const rf = await pool.query('SELECT ceap_id FROM ceap_fases WHERE id = $1', [ceapFaseId]);
      const ceapId = rf.rows[0]?.ceap_id;
      console.log('CEAP ID for this fase:', ceapId);

      if (ceapId) {
        console.log('Testing updateProgress for ceapId:', ceapId);
        const progressResult = await pool.query(
            `WITH doc_stats AS (
               SELECT
                 cf.id as fase_id,
                 COUNT(d.id) as total_docs,
                 COALESCE(SUM(CASE WHEN d.capturado_plantel = true THEN 1 ELSE 0 END), 0) as docs_capturados,
                 COALESCE(SUM(CASE WHEN d.estado_verificacion = 'verificado' THEN 1 ELSE 0 END), 0) as docs_verificados
               FROM ceap_fases cf
               LEFT JOIN ceap_fase_documentos d ON cf.id = d.ceap_fase_id
               WHERE cf.ceap_id = $1
               GROUP BY cf.id
             )
             SELECT
               COALESCE(SUM(
                 CASE WHEN total_docs > 0 THEN
                   ((docs_capturados::float / total_docs) * 75) +
                   ((docs_verificados::float / total_docs) * 25)
                 ELSE 0 END
               ), 0) as suma_porcentajes,
               COUNT(*) as total_fases
             FROM doc_stats`,
            [ceapId]
          );
          console.table(progressResult.rows);
      }
      
      await pool.end();
  } catch (e) {
    console.error('--- ERROR ---');
    console.error(e);
    await pool.end();
  }
}
testUpdate();
