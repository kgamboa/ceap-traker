const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');
require('dotenv').config();

async function runMigrations() {
  try {
    console.log('Iniciando migraciones...');
    
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✓ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error en las migraciones:', error);
    process.exit(1);
  }
}

runMigrations();
