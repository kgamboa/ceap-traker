const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Cargar variables de entorno primero
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigrations() {
  // Crear conexión directa usando DATABASE_URL o variables individuales
  const pool = new Pool(
    process.env.DATABASE_URL
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        }
      : {
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME || 'ceap_tracker',
        }
  );

  try {
    console.log('Iniciando migraciones...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    console.log('✓ Ejecutando seed data...');
    
    const seedPath = path.join(__dirname, '../migrations/002_seed_data.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    
    await pool.query(seedSql);
    
    console.log('✓ Migraciones completadas exitosamente');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error en las migraciones:', error.message);
    process.exit(1);
  }
}

runMigrations();
