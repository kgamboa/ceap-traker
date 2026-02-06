// db.js
// Configuración de conexión a PostgreSQL para Railway
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Railway proporciona esta variable de entorno
    ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : false,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
