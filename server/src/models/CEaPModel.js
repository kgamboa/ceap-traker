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
        COALESCE(SUM(CASE WHEN cf.completado = true THEN 1 ELSE 0 END), 0)::integer as fases_completadas
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
        json_agg(
          json_build_object(
            'fase_id', cf.fase_id,
            'fase_nombre', f.nombre,
            'numero_orden', f.numero_orden,
            'estado', cf.estado,
            'completado', cf.completado,
            'fecha_conclusión', cf.fecha_conclusión
          ) ORDER BY f.numero_orden
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
    // Calcular porcentaje de avance
    const progressResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN completado = true THEN 1 ELSE 0 END) as completadas
       FROM ceap_fases
       WHERE ceap_id = $1`,
      [ceapId]
    );

    const { total, completadas } = progressResult.rows[0];
    const percentage = total > 0 ? Math.round((completadas / total) * 100) : 0;

    const result = await pool.query(
      `UPDATE ceaps 
       SET porcentaje_avance = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [percentage, ceapId]
    );
    return result.rows[0];
  }

  static async delete(ceapId) {
    // Primero eliminar las fases asociadas
    await pool.query(
      'DELETE FROM ceap_fases WHERE ceap_id = $1',
      [ceapId]
    );

    // Luego eliminar el CEAP
    const result = await pool.query(
      'DELETE FROM ceaps WHERE id = $1 RETURNING *',
      [ceapId]
    );
    return result.rows[0];
  }
}

module.exports = CEaPModel;
