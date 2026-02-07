const pool = require('../config/database');

class PlanteleModel {
  static async getAll() {
    const result = await pool.query(
      'SELECT * FROM planteles WHERE activo = true ORDER BY nombre'
    );
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(
      'SELECT * FROM planteles WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(datos) {
    const { nombre, codigo, estado, municipio, director_email, director_nombre, telefono } = datos;
    const result = await pool.query(
      `INSERT INTO planteles (nombre, codigo, estado, municipio, director_email, director_nombre, telefono)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, codigo, estado, municipio, director_email, director_nombre, telefono]
    );
    return result.rows[0];
  }

  static async update(id, datos) {
    const { nombre, codigo, estado, municipio, director_email, director_nombre, telefono } = datos;
    const result = await pool.query(
      `UPDATE planteles 
       SET nombre = $1, codigo = $2, estado = $3, municipio = $4, 
           director_email = $5, director_nombre = $6, telefono = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [nombre, codigo, estado, municipio, director_email, director_nombre, telefono, id]
    );
    return result.rows[0];
  }
}

module.exports = PlanteleModel;
