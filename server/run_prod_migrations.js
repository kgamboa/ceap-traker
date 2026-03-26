const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres:alpoPzykkhCSfXdfvVGgktDrDimiiFWo@switchback.proxy.rlwy.net:47630/railway';

async function runProductionMigrations() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('--- RUNNING PRODUCTION MIGRATIONS ---');
    
    // Ensure schema_migrations table exists (consistency with your system)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Files to run in order
    const migrationFiles = [
      '002_refactor_fases_and_docs.sql',
      '003_documentos_catalog.sql'
    ];
    
    for (const migrationFile of migrationFiles) {
        const filePath = path.join(__dirname, 'migrations', migrationFile);
        
        // Check if already executed
        const alreadyRun = await pool.query('SELECT * FROM schema_migrations WHERE name = $1', [migrationFile]);
        
        if (alreadyRun.rows.length > 0) {
            console.log(`Migration ${migrationFile} already executed. Skipping.`);
        } else {
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Executing ${migrationFile}...`);
            await pool.query(sql);
            await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationFile]);
            console.log(`✓ Migration ${migrationFile} executed successfully.`);
        }
    }

    // Insert Admin Users (Joaquin and Karlo) if they don't exist
    // Check if they already exist in what looks like the users table
    // Assuming 'planteles' table holds basic users or there's a specific table. 
    // In App.js logic is hardcoded for 'Admin', but we need database persistence if we change that.
    
    console.log('--- FINISHED MIGRATIONS ---');

  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    await pool.end();
  }
}

runProductionMigrations();
