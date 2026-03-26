const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';

async function checkLegacyPhases() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- EXPORTING LEGACY PHASES (Actas & Registro Público) ---');
    
    const res = await pool.query(`
      SELECT 
        p.nombre as plantel, 
        p.codigo, 
        f.nombre as fase, 
        cf.fecha_conclusión,
        c.ciclo_inicio,
        c.ciclo_fin
      FROM ceap_fases cf
      JOIN ceaps c ON cf.ceap_id = c.id
      JOIN planteles p ON c.plantel_id = p.id
      JOIN fases f ON cf.fase_id = f.id
      WHERE f.nombre IN ('Actas', 'Registro Público') 
      AND cf.completado = true
      ORDER BY p.nombre, f.numero_orden
    `);
    
    if (res.rows.length === 0) {
      console.log('No legacy data found for these phases.');
    } else {
      console.table(res.rows);
      // Save to a file for the user to keep
      const fs = require('fs');
      const csv = 'Plantel,Codigo,Fase,Fecha Conclusion,Ciclo\n' + 
            res.rows.map(r => `"${r.plantel}","${r.codigo}","${r.fase}","${r.fecha_conclusión}","${r.ciclo_inicio}-${r.ciclo_fin}"`).join('\n');
      fs.writeFileSync('legacy_phases_data.csv', csv);
      console.log('Data saved to legacy_phases_data.csv');
    }

  } catch (err) {
    console.error('Error connecting to Railway:', err.message);
  } finally {
    await pool.end();
  }
}

checkLegacyPhases();
