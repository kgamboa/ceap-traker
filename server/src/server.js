const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const routes = require('./routes/index');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para esperar a que PostgreSQL esté disponible
async function waitForDatabase(maxRetries = 30) {
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

  for (let i = 0; i < maxRetries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('✓ Conexión a PostgreSQL establecida');
      return pool;
    } catch (error) {
      console.log(`Intento ${i + 1}/${maxRetries}: Esperando PostgreSQL...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('No se pudo conectar a PostgreSQL después de varios intentos');
}

// Función para ejecutar migraciones
async function runMigrationsOnStartup(pool) {
  try {
    console.log('Ejecutando migraciones...');
    
    // Ejecutar schema
    const schemaPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('✓ Schema migrado exitosamente');
    
    // Ejecutar seed data
    const seedPath = path.join(__dirname, '../migrations/002_seed_data.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await pool.query(seedSql);
    console.log('✓ Seed data insertado exitosamente');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Migraciones ya ejecutadas anteriormente');
    } else {
      console.error('Error en migraciones:', error.message);
    }
  }
}

// Servir archivos estáticos del cliente (en producción)
const clientPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientPath));

// Rutas API
app.use('/api', routes);

// Servir el cliente para todas las rutas que no sean API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ error: 'Página no encontrada' });
      }
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;

// Esperar a que PostgreSQL esté disponible, luego ejecutar migraciones
waitForDatabase()
  .then(async (pool) => {
    await runMigrationsOnStartup(pool);
    await pool.end();
    
    app.listen(PORT, () => {
      console.log(`Servidor CEaP Tracker ejecutándose en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error fatal:', error.message);
    process.exit(1);
  });
