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
        cf.updated_at
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
      const docs = fasesCatalog[fase.numero_orden] || [];
      
      for (const doc of docs) {
         await pool.query(
           `INSERT INTO ceap_fase_documentos (ceap_fase_id, documento_nombre, documento_clave)
            VALUES ($1, $2, $3)
            ON CONFLICT (ceap_fase_id, documento_clave) DO NOTHING`,
           [rfId, doc.nombre, doc.clave]
         );
      }
    }
  }

  static async getDocumentos(ceapFaseId) {
    const result = await pool.query(
      `SELECT * FROM ceap_fase_documentos WHERE ceap_fase_id = $1 ORDER BY id ASC`,
      [ceapFaseId]
    );
    return result.rows;
  }

  static async updateDocumento(ceapFaseId, documentoClave, datos) {
    const { capturado_plantel, estado_verificacion, isAdmin } = datos;
    
    // Si viene del plantel y cambia a capturado
    if (!isAdmin && capturado_plantel !== undefined) {
      const result = await pool.query(
        `UPDATE ceap_fase_documentos 
         SET capturado_plantel = $1, 
             fecha_captura = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE ceap_fase_id = $2 AND documento_clave = $3
         RETURNING *`,
        [capturado_plantel, ceapFaseId, documentoClave]
      );
      return result.rows[0];
    }
    
    // Si viene del admin y cambia el estado
    if (isAdmin && estado_verificacion !== undefined) {
      const result = await pool.query(
        `UPDATE ceap_fase_documentos 
         SET estado_verificacion = $1, 
             fecha_verificacion = CASE WHEN $1 = 'verificado' THEN CURRENT_TIMESTAMP ELSE null END,
             updated_at = CURRENT_TIMESTAMP
         WHERE ceap_fase_id = $2 AND documento_clave = $3
         RETURNING *`,
        [estado_verificacion, ceapFaseId, documentoClave]
      );
      return result.rows[0];
    }
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
