const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway'
});

async function updateProjectProgress(ceapId) {
  await pool.query(
    `UPDATE ceaps c
     SET porcentaje_avance = COALESCE((
       SELECT ROUND(AVG(COALESCE(porc, 0))) FROM (
         SELECT 
           ((COUNT(NULLIF(d.capturado_plantel, false))::float / NULLIF(COUNT(*), 0)) * 75) +
           ((SUM(CASE WHEN d.estado_verificacion IN ('verificado', 'no_aplica') THEN 1.0 WHEN d.estado_verificacion = 'observado' THEN 0.5 ELSE 0 END)::float / NULLIF(COUNT(*), 0)) * 25) as porc
         FROM ceap_fases cf
         LEFT JOIN ceap_fase_documentos d ON cf.id = d.ceap_fase_id
         WHERE cf.ceap_id = $1
         GROUP BY cf.id
       ) phase_stats
     ), 0)
     WHERE id = $1`,
    [ceapId]
  );
}

async function restore() {
  try {
    const csvPath = path.join(__dirname, '../legacy_phases_data.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    const results = lines.slice(1).map(line => {
       const parts = line.split(',').map(p => p.replace(/"/g, '').trim());
       return {
         Plantel: parts[0],
         Codigo: parts[1],
         Fase: parts[2],
         FechaConclusion: parts[3],
         Ciclo: parts[4]
       };
    });

    // Agrupar por plantel para detectar el "100%" (legacy tenía ambos hitos)
    const plantelesLegacy = {};
    results.forEach(row => {
      if (!row.Codigo) return;
      if (!plantelesLegacy[row.Codigo]) {
        plantelesLegacy[row.Codigo] = { fases: [], dates: {} };
      }
      if (row.FechaConclusion && row.FechaConclusion !== 'null') {
        plantelesLegacy[row.Codigo].fases.push(row.Fase);
        plantelesLegacy[row.Codigo].dates[row.Fase] = new Date(row.FechaConclusion);
      }
    });

    console.log(`\nIniciando restauración de ${Object.keys(plantelesLegacy).length} planteles...\n`);

    for (const [codigo, data] of Object.entries(plantelesLegacy)) {
      const resP = await pool.query('SELECT id FROM planteles WHERE codigo = $1', [codigo]);
      if (resP.rows.length === 0) {
        console.warn(`[!] Plantel ${codigo} no encontrado en la base de datos.`);
        continue;
      }
      const plantelId = resP.rows[0].id;

      // Buscar CEAP más reciente (2025 o similar)
      const resC = await pool.query('SELECT id FROM ceaps WHERE plantel_id = $1 ORDER BY ciclo_inicio DESC LIMIT 1', [plantelId]);
      if (resC.rows.length === 0) continue;
      const ceapId = resC.rows[0].id;

      const hasActas = data.fases.includes('Actas');
      const hasRegistro = data.fases.includes('Registro Público');

      let nuevasFases = [];
      if (hasActas && hasRegistro) {
        // SEGÚN SOLICITUD: Si ya tenían el 100% en legacy, ponerles el 75% (todas las fases capturadas)
        console.log(`[*] ${codigo}: Detectado 100% Legacy. Restaurando las 5 fases.`);
        nuevasFases = ['Convocatoria', 'Asambleas', 'Notario Público', 'SAT', 'Cuenta Bancaria'];
      } else {
        if (hasActas) nuevasFases.push('Convocatoria', 'Asambleas');
        if (hasRegistro) nuevasFases.push('Notario Público');
      }

      for (const nombreFase of nuevasFases) {
        const resF = await pool.query(
          `SELECT cf.id FROM ceap_fases cf JOIN fases f ON cf.fase_id = f.id WHERE cf.ceap_id = $1 AND f.nombre = $2`,
          [ceapId, nombreFase]
        );

        if (resF.rows.length > 0) {
          const ceapFaseId = resF.rows[0].id;
          const fecha = data.dates['Registro Público'] || data.dates['Actas'] || new Date();

          // 1. Marcar documentos como capturados
          await pool.query(
            `UPDATE ceap_fase_documentos SET capturado_plantel = true, fecha_captura = $1 WHERE ceap_fase_id = $2`,
            [fecha, ceapFaseId]
          );

          // 2. Marcar fase como completada (en captura)
          await pool.query(
            `UPDATE ceap_fases SET estado = 'completado', ultima_actualizacion_documento = $1 WHERE id = $2`,
            [fecha, ceapFaseId]
          );
        }
      }

      // Actualizar progreso
      await updateProjectProgress(ceapId);
      process.stdout.write(`.`);
    }

    console.log('\n\n✓ Restauración completada correctamente.');
  } catch (e) {
    console.error('\nError crítico:', e);
  } finally {
    await pool.end();
  }
}

restore();
