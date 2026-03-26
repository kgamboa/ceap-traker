const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';

const fasesCatalog = {
  1: [
    { clave: 'convocatoria_padres', nombre: 'Convocatoria Padres de Familia' },
    { clave: 'convocatoria_trabajadores', nombre: 'Convocatoria Trabajadores' },
    { clave: 'convocatoria_alumnos', nombre: 'Convocatoria Alumnos' },
  ],
  2: [
    { clave: 'acta_padres', nombre: 'Acta de Asamblea Padres de Familia' },
    { clave: 'lista_padres', nombre: 'Lista de Asistencia Padres de Familia' },
    { clave: 'evidencia_padres', nombre: 'Evidencia Fotográfica Asamblea Padres de Familia' },
    { clave: 'acta_trabajadores', nombre: 'Acta de Asamblea Trabajadores' },
    { clave: 'lista_trabajadores', nombre: 'Lista de Asistencia Trabajadores' },
    { clave: 'evidencia_trabajadores', nombre: 'Evidencia Fotográfica Asamblea Trabajadores' },
    { clave: 'acta_alumnos', nombre: 'Acta de Asamblea Alumnos' },
    { clave: 'lista_alumnos', nombre: 'Lista de Asistencia Alumnos' },
    { clave: 'evidencia_alumnos', nombre: 'Evidencia Fotográfica Asamblea Alumnos' },
  ],
  3: [
    { clave: 'acta_constitutiva', nombre: 'Acta Constitutiva Notariada' },
    { clave: 'registro_publico', nombre: 'Registro Público' },
  ],
  4: [
    { clave: 'constancia_fiscal', nombre: 'Constancia de Situación Fiscal (RFC)' },
    { clave: 'e_firma', nombre: 'Acuse de Generación de e.firma' },
    { clave: 'opinion_cumplimiento', nombre: 'Autorizar Resultado Público de la Opinión de Cumplimiento Fiscal' },
  ],
  5: [
    { clave: 'contrato_cuenta', nombre: 'Contrato de Apertura de Cuenta' },
    { clave: 'registro_firmas', nombre: 'Registro de Firmas Autorizadas' },
  ]
};

async function updateDocuments() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- ACTUALIZANDO DOCUMENTOS ---');

    // 1. Borrar todos los documentos existentes (ninguno tiene datos capturados aún)
    const delResult = await pool.query('DELETE FROM ceap_fase_documentos');
    console.log(`Eliminados ${delResult.rowCount} documentos anteriores.`);

    // 2. Obtener todas las ceap_fases con su numero_orden
    const ceapFases = await pool.query(`
      SELECT cf.id as ceap_fase_id, f.numero_orden
      FROM ceap_fases cf
      JOIN fases f ON cf.fase_id = f.id
      ORDER BY cf.id
    `);

    console.log(`Encontradas ${ceapFases.rows.length} ceap_fases.`);

    let insertados = 0;

    for (const row of ceapFases.rows) {
      const docs = fasesCatalog[row.numero_orden] || [];
      for (const doc of docs) {
        await pool.query(
          `INSERT INTO ceap_fase_documentos (ceap_fase_id, documento_nombre, documento_clave)
           VALUES ($1, $2, $3)
           ON CONFLICT (ceap_fase_id, documento_clave) DO NOTHING`,
          [row.ceap_fase_id, doc.nombre, doc.clave]
        );
        insertados++;
      }
    }

    console.log(`✓ Documentos insertados: ${insertados}`);

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
