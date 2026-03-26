const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway'
});

async function restore() {
  const csvPath = path.join(__dirname, '..', 'legacy_phases_data.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').slice(1); // Skip header

  for (const line of lines) {
    if (!line.trim()) continue;
    
    // Simple CSV parser for quoted strings
    const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    if (!parts || parts.length < 4) {
      console.log(`Línea inválida: ${line}`);
      continue;
    }

    const codigo = parts[1].replace(/"/g, '');
    const faseLegacy = parts[2].replace(/"/g, '');
    const fechaStr = parts[3].replace(/"/g, '');
    const ciclo = parts[4]?.replace(/"/g, '') || '2025-2027';

    if (fechaStr === 'null' || !fechaStr) continue;

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      console.log(`Fecha inválida para ${codigo}: ${fechaStr}`);
      continue;
    }

    const [cicloInicio, cicloFin] = ciclo.split('-');

    try {
      // 1. Encontrar el CEAP
      const ceapRes = await pool.query(
        `SELECT c.id FROM ceaps c 
         JOIN planteles p ON c.plantel_id = p.id 
         WHERE p.codigo = $1 AND c.ciclo_inicio = $2`,
        [codigo, parseInt(cicloInicio)]
      );

      if (ceapRes.rows.length === 0) {
        console.log(`No se encontró CEAP para ${codigo} ${ciclo}`);
        continue;
      }

      const ceapId = ceapRes.rows[0].id;

      // 2. Mapear fase legacy a nuevas fases
      let nuevasFases = [];
      if (faseLegacy === 'Actas') {
        nuevasFases = ['Convocatoria', 'Asambleas'];
      } else if (faseLegacy === 'Registro Público') {
        nuevasFases = ['Notaria/Registro Público'];
      }

      for (const faseNombre of nuevasFases) {
        const faseRes = await pool.query(
          `SELECT cf.id FROM ceap_fases cf 
           JOIN fases f ON cf.fase_id = f.id 
           WHERE cf.ceap_id = $1 AND f.nombre = $2`,
          [ceapId, faseNombre]
        );

        if (faseRes.rows.length > 0) {
          const ceapFaseId = faseRes.rows[0].id;
          
          process.stdout.write(`.`); // Minimal logging

          await pool.query(
            `UPDATE ceap_fase_documentos 
             SET capturado_plantel = true, 
                 fecha_captura = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE ceap_fase_id = $2`,
            [fecha, ceapFaseId]
          );

          await pool.query(
            `UPDATE ceap_fases SET estado = 'en_progreso' WHERE id = $1`,
            [ceapFaseId]
          );
        }
      }
    } catch (e) {
      console.error(`\nError procesando ${codigo}:`, e.message);
    }
  }

  console.log('\nRecalculando avances globales...');
  try {
    await pool.query(`
      UPDATE ceaps c
      SET porcentaje_avance = COALESCE((
        SELECT ROUND(AVG(COALESCE(porc, 0))) FROM (
          SELECT 
            ((COUNT(NULLIF(d.capturado_plantel, false))::float / NULLIF(COUNT(*), 0)) * 75) +
            ((SUM(CASE WHEN d.estado_verificacion = 'verificado' THEN 1.0 WHEN d.estado_verificacion = 'observado' THEN 0.5 ELSE 0 END)::float / NULLIF(COUNT(*), 0)) * 25) as porc
          FROM ceap_fases cf
          LEFT JOIN ceap_fase_documentos d ON cf.id = d.ceap_fase_id
          WHERE cf.ceap_id = c.id
          GROUP BY cf.id
        ) phase_stats
      ), 0)
    `);
    console.log('Restauración completada.');
  } catch (err) {
    console.error('Error final recalculando:', err.message);
  }
  pool.end();
}

restore().catch(err => {
  console.error(err);
  pool.end();
});
