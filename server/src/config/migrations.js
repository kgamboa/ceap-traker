const fs = require('fs');
const path = require('path');
const pool = require('./database');

/**
 * Sistema de migraciones automáticas
 * - Lee archivo de migración SQL
 * - Verifica en tabla de migraciones si ya fue ejecutada
 * - La ejecuta solo una vez
 */

const migrationsDir = path.join(__dirname, '../..', 'migrations');

// Tabla de control de migraciones
const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

/**
 * Ejecuta las migraciones automáticamente al iniciar
 */
async function runMigrations() {
    try {
        // 1. Crear tabla de control de migraciones si no existe
        await pool.query(CREATE_MIGRATIONS_TABLE);
        console.log('✓ Tabla de migraciones verificada');

        // 2. Leer archivos de migración
        if (!fs.existsSync(migrationsDir)) {
            console.log('⚠ Directorio de migraciones no encontrado, omitiendo.');
            return;
        }

        const migrationFiles = fs
            .readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (migrationFiles.length === 0) {
            console.log('⚠ No hay archivos de migración para ejecutar');
            return;
        }

        // 3. Ejecutar cada migración una sola vez
        for (const file of migrationFiles) {
            // Verificar si ya fue ejecutada
            const result = await pool.query(
                'SELECT * FROM schema_migrations WHERE name = $1',
                [file]
            );

            if (result.rows.length > 0) {
                console.log(`⏭️  Migración ya ejecutada: ${file}`);
                continue;
            }

            // Leer archivo SQL
            const filePath = path.join(migrationsDir, file);
            const sqlContent = fs.readFileSync(filePath, 'utf8');

            // Ejecutar migración
            console.log(`⏳ Ejecutando migración: ${file}`);
            await pool.query(sqlContent);

            // Registrar que se ejecutó
            await pool.query(
                'INSERT INTO schema_migrations (name) VALUES ($1)',
                [file]
            );

            console.log(`✓ Migración completada: ${file}`);
        }

        console.log('✓ Todas las migraciones completadas exitosamente');
    } catch (error) {
        console.error('❌ Error en migraciones:', error.message);
        throw error; // Re-lanzar para que el servidor no inicie si falla la migración
    }
}

module.exports = { runMigrations };
