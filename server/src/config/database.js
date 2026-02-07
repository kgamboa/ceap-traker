const { Pool } = require('pg');

// Cargar dotenv solo si no estamos en producción
if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL) {
  require('dotenv').config();
}

// En Railway: usar DATABASE_URL (variable automática)
// En desarrollo: usar variables individuales o DATABASE_URL
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ceap_tracker',
    });

pool.on('error', (err) => {
  console.error('Error en el pool de PostgreSQL:', err);
});

module.exports = pool;
