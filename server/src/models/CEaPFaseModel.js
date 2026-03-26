const pool = require('../config/database');
const fasesCatalog = require('./fasesCatalog');

class CEaPFaseModel {
  static async getByCodeAP(ceapId) {
    const result = await pool.query(
      `SELECT 
        cf.id,
        cf.ceap_id,
        cf.fase_id,
        f.nombre as fase_nombre,
        f.numero_orden,
        f.descripcion,
        cf.estado,
        cf.fecha_conclusión,
        cf.fecha_estimada,
        cf.observaciones,
        cf.completado,
        cf.fecha_completado,
        cf.evidencias_verificadas,
        cf.fecha_verificacion,
        cf.ultima_actualizacion_usuario,
        cf.ultima_actualizacion_admin,
        cf.ultima_actualizacion_documento,
        cf.created_at,
        cf.updated_at,
        COALESCE(
          (SELECT ROUND(
            ((COUNT(NULLIF(d.capturado_plantel, false))::float / NULLIF(COUNT(*), 0)) * 75) +
            ((COUNT(NULLIF(d.estado_verificacion = 'verificado', false))::float / NULLIF(COUNT(*), 0)) * 25)
          )
          FROM ceap_fase_documentos d 
          WHERE d.ceap_fase_id = cf.id), 0
        ) as porcentaje
       FROM ceap_fases cf
       JOIN fases f ON cf.fase_id = f.id
       WHERE cf.ceap_id = $1
       ORDER BY f.numero_orden`,
      [ceapId]
    );
    return result.rows;
  }

  static async getLastFaseStatus(plantelId) {
    const result = await pool.query(
      `SELECT 
        cf.id,
        cf.ceap_id,
        cf.fase_id,
        f.nombre as fase_nombre,
        f.numero_orden,
        cf.estado,
        cf.fecha_conclusión,
        cf.completado,
        cf.evidencias_verificadas,
        c.ciclo_inicio,
        c.ciclo_fin
       FROM ceap_fases cf
       JOIN fases f ON cf.fase_id = f.id
       JOIN ceaps c ON cf.ceap_id = c.id
       WHERE c.plantel_id = $1
       ORDER BY c.created_at DESC, f.numero_orden
       LIMIT 7`,
      [plantelId]
    );
    return result.rows;
  }

  static async update(ceapFaseId, datos) {
    const {
      estado,
      fecha_conclusión,
      fecha_estimada,
      observaciones,
      completado,
      evidencias_verificadas,
      ultima_actualizacion_usuario,
      ultima_actualizacion_admin,
      ultima_actualizacion_documento,
      isAdmin = false
    } = datos;

    // Determine timestamp columns based on admin status
    const updateTimestamp = isAdmin ? 'ultima_actualizacion_admin' : 'ultima_actualizacion_usuario';

    const result = await pool.query(
      `UPDATE ceap_fases
       SET estado = COALESCE($1, estado),
           fecha_conclusión = COALESCE($2, fecha_conclusión),
           fecha_estimada = COALESCE($3, fecha_estimada),
           observaciones = COALESCE($4, observaciones),
           completado = COALESCE($5, completado),
           fecha_completado = CASE WHEN $5 = true THEN CURRENT_DATE ELSE fecha_completado END,
           evidencias_verificadas = COALESCE($6, evidencias_verificadas),
           fecha_verificacion = CASE WHEN $6 = true THEN CURRENT_DATE ELSE fecha_verificacion END,
           ultima_actualizacion_usuario = CASE WHEN $9::boolean = false THEN CURRENT_TIMESTAMP ELSE ultima_actualizacion_usuario END,
           ultima_actualizacion_admin = CASE WHEN $9::boolean = true THEN CURRENT_TIMESTAMP ELSE ultima_actualizacion_admin END,
           ultima_actualizacion_documento = COALESCE($7, ultima_actualizacion_documento),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        estado,
        fecha_conclusión,
        fecha_estimada,
        observaciones,
        completado,
        evidencias_verificadas,
        ultima_actualizacion_documento,
        ceapFaseId,
        isAdmin
      ]
    );

    return result.rows[0];
  }

  static async initializeFasesForCEAP(ceapId) {
    // Obtener todas las fases (solo deben quedar 5 después de la migración)
    const fasesResult = await pool.query('SELECT id, numero_orden FROM fases ORDER BY numero_orden');

    for (const fase of fasesResult.rows) {
      const faseInsertResult = await pool.query(
        `INSERT INTO ceap_fases (ceap_id, fase_id, estado)
         VALUES ($1, $2, 'no_iniciado')
         ON CONFLICT (ceap_id, fase_id) DO UPDATE SET estado = EXCLUDED.estado
         RETURNING id`,
        [ceapId, fase.id]
      );
      
      const rfId = faseInsertResult.rows[0].id;
      
      // Inyectar documentos desde el catálogo central
      await pool.query(
        `INSERT INTO ceap_fase_documentos (ceap_fase_id, documento_id)
         SELECT $1, id FROM ceap_documentos_catalog WHERE fase_numero_orden = $2
         ON CONFLICT (ceap_fase_id, documento_id) DO NOTHING`,
        [rfId, fase.numero_orden]
      );
    }
  }

  static async getDocumentos(ceapFaseId) {
    const result = await pool.query(
      `SELECT 
        d.id,
        d.ceap_fase_id,
        d.documento_id,
        c.nombre as documento_nombre,
        c.clave as documento_clave,
        d.capturado_plantel,
        d.fecha_captura,
        d.estado_verificacion,
        d.fecha_verificacion,
        d.created_at,
        d.updated_at
       FROM ceap_fase_documentos d
       JOIN ceap_documentos_catalog c ON d.documento_id = c.id
       WHERE d.ceap_fase_id = $1 
       ORDER BY c.numero_orden_doc ASC`,
      [ceapFaseId]
    );
    return result.rows;
  }

  static async updateDocumento(ceapFaseId, documentoId, datos) {
    const { capturado_plantel, estado_verificacion, isAdmin } = datos;
    let resultDoc;

    if (!isAdmin && capturado_plantel !== undefined) {
      const result = await pool.query(
        `UPDATE ceap_fase_documentos 
         SET capturado_plantel = $1, 
             fecha_captura = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE ceap_fase_id = $2 AND documento_id = $3
         RETURNING *`,
        [capturado_plantel, ceapFaseId, documentoId]
      );
      resultDoc = result.rows[0];
    } else if (isAdmin && estado_verificacion !== undefined) {
      const result = await pool.query(
        `UPDATE ceap_fase_documentos 
         SET estado_verificacion = $1, 
             fecha_verificacion = CASE WHEN $1 = 'verificado' THEN CURRENT_TIMESTAMP ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE ceap_fase_id = $2 AND documento_id = $3
         RETURNING *`,
        [estado_verificacion, ceapFaseId, documentoId]
      );
      resultDoc = result.rows[0];
    }

    // Now recalculate the phase status
    if (resultDoc) {
      const docsResult = await pool.query(`SELECT * FROM ceap_fase_documentos WHERE ceap_fase_id = $1`, [ceapFaseId]);
      const docs = docsResult.rows;
      const total = docs.length;
      const captured = docs.filter(d => d.capturado_plantel).length;
      const verified = docs.filter(d => d.estado_verificacion === 'verificado').length;

      let newState = 'no_iniciado';
      let isCompleted = false;

      if (captured === total && verified === total && total > 0) {
        newState = 'completado';
        isCompleted = true;
      } else if (captured > 0 || verified > 0) {
        newState = 'en_progreso';
      }

      await pool.query(
        `UPDATE ceap_fases 
         SET estado = $1, 
             completado = $2,
             fecha_conclusión = CASE WHEN $1 = 'completado' THEN COALESCE(fecha_conclusión, CURRENT_DATE) ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newState, isCompleted, ceapFaseId]
      );
    }

    return resultDoc;
  }

  static async getObservaciones(ceapFaseId) {
    const result = await pool.query(
      `SELECT * FROM ceap_fase_observaciones WHERE ceap_fase_id = $1 ORDER BY created_at ASC`,
      [ceapFaseId]
    );
    return result.rows;
  }

  static async addObservacion(ceapFaseId, usuario_nombre, es_admin, mensaje) {
    const result = await pool.query(
      `INSERT INTO ceap_fase_observaciones (ceap_fase_id, usuario_nombre, es_admin, mensaje)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ceapFaseId, usuario_nombre, es_admin, mensaje]
    );
    return result.rows[0];
  }
}

module.exports = CEaPFaseModel;
