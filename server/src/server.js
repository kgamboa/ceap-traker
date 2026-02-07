const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes/index');
const pool = require('./config/database');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Función para ejecutar migraciones
async function runMigrationsOnStartup() {
  try {
    console.log('Verificando y ejecutando migraciones...');
    
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
    console.log('Migraciones ya ejecutadas o error:', error.message);
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

// Ejecutar migraciones antes de iniciar el servidor
runMigrationsOnStartup().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor CEaP Tracker ejecutándose en puerto ${PORT}`);
  });
}).catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
