const pool = require('../config/database');

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
    const { estado, fecha_conclusión, fecha_estimada, observaciones, completado } = datos;
    
    const result = await pool.query(
      `UPDATE ceap_fases
       SET estado = COALESCE($1, estado),
           fecha_conclusión = COALESCE($2, fecha_conclusión),
           fecha_estimada = COALESCE($3, fecha_estimada),
           observaciones = COALESCE($4, observaciones),
           completado = COALESCE($5, completado),
           fecha_completado = CASE WHEN $5 = true THEN CURRENT_DATE ELSE fecha_completado END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [estado, fecha_conclusión, fecha_estimada, observaciones, completado, ceapFaseId]
    );
    
    return result.rows[0];
  }

  static async initializeFasesForCEAP(ceapId) {
    // Obtener todas las fases
    const fasesResult = await pool.query('SELECT id FROM fases ORDER BY numero_orden');
    
    for (const fase of fasesResult.rows) {
      await pool.query(
        `INSERT INTO ceap_fases (ceap_id, fase_id, estado)
         VALUES ($1, $2, 'no_iniciado')
         ON CONFLICT (ceap_id, fase_id) DO NOTHING`,
        [ceapId, fase.id]
      );
    }
  }
}

module.exports = CEaPFaseModel;
