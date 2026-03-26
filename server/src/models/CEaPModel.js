const pool = require('../config/database');

class CEaPModel {
  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM ceaps WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async getByPlanteles(plantelId) {
    const result = await pool.query(
      `SELECT c.*, p.nombre as plantel_nombre,
        COUNT(cf.id) as total_fases,
        COALESCE(SUM(CASE WHEN cf.completado = true THEN 1 ELSE 0 END), 0)::integer as fases_completadas,
        MAX(cf.ultima_actualizacion_usuario) as ultima_actualizacion_usuario,
        MAX(cf.ultima_actualizacion_admin) as ultima_actualizacion_admin,
        MAX(cf.ultima_actualizacion_documento) as ultima_actualizacion_documento
       FROM ceaps c
       JOIN planteles p ON c.plantel_id = p.id
       LEFT JOIN ceap_fases cf ON c.id = cf.ceap_id
       WHERE c.plantel_id = $1
       GROUP BY c.id, p.id
       ORDER BY c.ciclo_inicio DESC`,
      [plantelId]
    );
    return result.rows;
  }

  static async getAllWithProgress() {
    const result = await pool.query(
      `WITH ceaps_recientes AS (
        SELECT DISTINCT ON (plantel_id)
          c.id,
          c.plantel_id,
          c.ciclo_inicio,
          c.ciclo_fin,
          c.estado,
          c.porcentaje_avance,
          c.created_at
        FROM ceaps c
        ORDER BY c.plantel_id, c.created_at DESC
      )
      SELECT 
        cr.id,
        cr.plantel_id,
        p.nombre as plantel_nombre,
        p.codigo as plantel_codigo,
        cr.ciclo_inicio,
        cr.ciclo_fin,
        cr.estado,
        COALESCE(cr.porcentaje_avance, 0)::integer as porcentaje_avance,
        cr.created_at,
        COUNT(cf.id) as total_fases,
        COALESCE(SUM(CASE WHEN cf.completado = true THEN 1 ELSE 0 END), 0)::integer as fases_completadas,
        MAX(cf.ultima_actualizacion_usuario) as ultima_actualizacion_usuario,
        MAX(cf.ultima_actualizacion_admin) as ultima_actualizacion_admin,
        MAX(cf.ultima_actualizacion_documento) as ultima_actualizacion_documento,
        json_agg(
          json_build_object(
            'id', cf.id,
            'fase_nombre', f.nombre,
            'estado', cf.estado,
            'completado', cf.completado,
            'fecha_estimada', cf.fecha_estimada,
            'fecha_conclusión', cf.fecha_conclusión
          )
        ) FILTER (WHERE cf.id IS NOT NULL) as fases
       FROM ceaps_recientes cr
       JOIN planteles p ON cr.plantel_id = p.id
       LEFT JOIN ceap_fases cf ON cr.id = cf.ceap_id
       LEFT JOIN fases f ON cf.fase_id = f.id
       GROUP BY cr.id, cr.plantel_id, p.nombre, p.codigo, cr.ciclo_inicio, cr.ciclo_fin, cr.estado, cr.porcentaje_avance, cr.created_at
       ORDER BY p.nombre`,
      []
    );
    return result.rows;
  }

  static async create(plantelId, cicloInicio, cicloFin) {
    const result = await pool.query(
      `INSERT INTO ceaps (plantel_id, ciclo_inicio, ciclo_fin)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [plantelId, cicloInicio, cicloFin]
    );
    return result.rows[0];
  }

  static async updateProgress(ceapId) {
    if (!ceapId) return 0;
    
    // Calculate total progress: 75% for documentation, 25% for verification
    const progressResult = await pool.query(
      `WITH doc_stats AS (
         SELECT
           cf.id as fase_id,
           COUNT(d.id) as total_docs,
           COALESCE(SUM(CASE WHEN d.capturado_plantel = true THEN 1 ELSE 0 END), 0) as docs_capturados,
           COALESCE(SUM(CASE 
             WHEN d.estado_verificacion = 'verificado' THEN 1.0 
             WHEN d.estado_verificacion = 'observado' THEN 0.5 
             ELSE 0 END), 0) as docs_verificados_weighted
         FROM ceap_fases cf
         LEFT JOIN ceap_fase_documentos d ON cf.id = d.ceap_fase_id
         WHERE cf.ceap_id = $1::uuid
         GROUP BY cf.id
       )
       SELECT
         COALESCE(SUM(
           CASE WHEN total_docs > 0 THEN
             ((docs_capturados::float / total_docs) * 75) +
             ((docs_verificados_weighted::float / total_docs) * 25)
           ELSE 0 END
         ), 0) as suma_porcentajes,
         COUNT(*) as total_fases
       FROM doc_stats`,
      [ceapId]
    );

    const { suma_porcentajes, total_fases } = progressResult.rows[0];
    const percentage = Number(total_fases) > 0 ? Math.round(Number(suma_porcentajes) / Number(total_fases)) : 0;

    const result = await pool.query(
      `UPDATE ceaps 
       SET porcentaje_avance = $1::integer, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2::uuid
       RETURNING porcentaje_avance`,
      [percentage, ceapId]
    );
    return result.rows[0];
  }

  static async delete(ceapId) {
    // Primero eliminar las fases asociadas
    await pool.query(
      'DELETE FROM ceap_fases WHERE ceap_id = $1::uuid',
      [ceapId]
    );

    // Luego eliminar el CEAP
    const result = await pool.query(
      'DELETE FROM ceaps WHERE id = $1::uuid RETURNING *',
      [ceapId]
    );
    return result.rows[0];
  }
}

module.exports = CEaPModel;
