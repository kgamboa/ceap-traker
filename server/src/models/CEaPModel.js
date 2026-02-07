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
      `SELECT c.*, p.nombre as plantel_nombre
       FROM ceaps c
       JOIN planteles p ON c.plantel_id = p.id
       WHERE c.plantel_id = $1
       ORDER BY c.ciclo_inicio DESC`,
      [plantelId]
    );
    return result.rows;
  }

  static async getAllWithProgress() {
    const result = await pool.query(
      `SELECT 
        c.id,
        c.plantel_id,
        p.nombre as plantel_nombre,
        p.codigo as plantel_codigo,
        c.ciclo_inicio,
        c.ciclo_fin,
        c.estado,
        c.porcentaje_avance,
        c.created_at,
        COUNT(cf.id) as total_fases,
        SUM(CASE WHEN cf.completado = true THEN 1 ELSE 0 END) as fases_completadas
       FROM ceaps c
       JOIN planteles p ON c.plantel_id = p.id
       LEFT JOIN ceap_fases cf ON c.id = cf.ceap_id
       GROUP BY c.id, p.id
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
